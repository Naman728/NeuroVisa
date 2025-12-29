from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api import deps
from app.models.interview import InterviewSession, Question, Answer, Feedback
from app.models.user import User
from app.schemas import interview as interview_schema
from app.services.ai_service import ai_service

router = APIRouter()

from fastapi import Body
from pydantic import BaseModel
class SessionCompleteSchema(BaseModel):
    status: Optional[str] = "completed"
    total_duration: Optional[int] = None

@router.post("/start", response_model=interview_schema.InterviewSession)
def start_interview(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Start a new interview session.
    """
    # If there's an existing in-progress session, end it first
    active_session = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.status == "in_progress"
    ).first()
    
    if active_session:
        active_session.status = "interrupted"
        active_session.end_time = datetime.now(timezone.utc)
        # Ensure start_time is treated as UTC for subtraction
        start_time = active_session.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        active_session.total_duration = int((active_session.end_time - start_time).total_seconds())
        # Calculate average score for the abandoned session if possible
        answers = db.query(Answer).join(Question).filter(Question.session_id == active_session.id).all()
        scores = [a.feedback.score for a in answers if a.feedback and a.feedback.score is not None]
        if scores:
            active_session.score = sum(scores) // len(scores)
        db.add(active_session)

    # Create Session
    session = InterviewSession(user_id=current_user.id, status="in_progress")
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Generate Questions
    user_profile = {
        "visa_type": current_user.visa_type,
        "target_country": current_user.target_country
    }
    questions_data = ai_service.generate_questions(user_profile)
    
    # Save Questions
    questions_objs = []
    for q in questions_data:
        q_obj = Question(session_id=session.id, text=q["text"], order=q["order"])
        db.add(q_obj)
        questions_objs.append(q_obj)
    
    db.commit()
    for q in questions_objs:
        db.refresh(q)
    
    session.questions = questions_objs # Ensure they are loaded
    return session

@router.get("/my-sessions", response_model=List[interview_schema.InterviewSession])
def get_my_sessions(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all interview sessions for current user.
    """
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.start_time.desc()).all()
    return sessions

@router.get("/{session_id}", response_model=interview_schema.InterviewSession)
def get_interview_session(
    session_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific interview session.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Section 3, Item 10: Generate improvement plan for completed sessions
    session_dict = {
        "id": session.id,
        "score": session.score,
        "status": session.status
    }
    
    improvement_plan = None
    if session.status == "completed":
        improvement_plan = ai_service.generate_improvement_plan(session_dict)
        
    return {
        "id": session.id,
        "user_id": session.user_id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "status": session.status,
        "score": session.score,
        "session_metadata": session.session_metadata,
        "questions": session.questions,
        "improvement_plan": improvement_plan
    }

@router.post("/answer", response_model=interview_schema.Answer)
def submit_answer(
    answer_in: interview_schema.AnswerCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit an answer to a question and get AI feedback.
    """
    # Verify question belongs to user's session
    question = db.query(Question).filter(Question.id == answer_in.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    session = db.query(InterviewSession).filter(InterviewSession.id == question.session_id).first()
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Save Answer
    answer = Answer(
        question_id=answer_in.question_id,
        user_audio_text=answer_in.user_audio_text,
        response_time_ms=answer_in.response_time_ms,
        edit_count=answer_in.edit_count
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    
    # Generate Feedback
    evaluation = ai_service.evaluate_answer(
        question.text, 
        answer.user_audio_text,
        stress_mode=answer_in.stress_mode,
        personality=answer_in.officer_personality
    )
    
    # Save Feedback
    feedback = Feedback(
        answer_id=answer.id,
        evaluation_json=evaluation, # Save entire evaluation dict
        score=evaluation["score"]
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    answer.feedback = feedback
    return answer

@router.post("/{session_id}/complete")
def complete_interview(
    session_id: int,
    session_data: Optional[SessionCompleteSchema] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Complete the interview session.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session.status = (session_data.status if session_data and session_data.status else "completed")
    session.end_time = datetime.now(timezone.utc)
    
    if session_data and session_data.total_duration is not None:
        session.total_duration = int(session_data.total_duration)
    else:
        # Ensure start_time is treated as UTC for subtraction
        start_time = session.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        session.total_duration = int((session.end_time - start_time).total_seconds())
    
    # Calculate average score with safety
    answers = db.query(Answer).join(Question).filter(Question.session_id == session.id).all()
    scores = [a.feedback.score for a in answers if a.feedback and a.feedback.score is not None]
    
    if scores:
        session.score = sum(scores) // len(scores)
    else:
        session.score = 0
    
    db.commit()
    return {"status": "completed", "final_score": session.score}
