from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Question Schemas
class QuestionBase(BaseModel):
    text: str
    order: int

class QuestionCreate(QuestionBase):
    session_id: int

class Question(QuestionBase):
    id: int
    session_id: int
    
    class Config:
        orm_mode = True

# Answer Schemas
class AnswerBase(BaseModel):
    user_audio_text: str
    response_time_ms: Optional[int] = None
    edit_count: Optional[int] = 0

class AnswerCreate(AnswerBase):
    question_id: int

class Answer(AnswerBase):
    id: int
    question_id: int
    feedback: Optional[Any] = None

    class Config:
        orm_mode = True

# Feedback Schemas
class FeedbackBase(BaseModel):
    evaluation_json: Any
    score: int

class Feedback(FeedbackBase):
    id: int
    answer_id: int
    
    class Config:
        orm_mode = True

# Session Schemas
class InterviewSessionBase(BaseModel):
    pass

class InterviewSessionCreate(InterviewSessionBase):
    pass

class InterviewSession(InterviewSessionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    score: Optional[int] = None
    session_metadata: Optional[Any] = None
    questions: List[Question] = []

    class Config:
        orm_mode = True
