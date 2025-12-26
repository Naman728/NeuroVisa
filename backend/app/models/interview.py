from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="in_progress") # in_progress, completed
    score = Column(Integer, nullable=True)

    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="session")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    text = Column(String, nullable=False)
    order = Column(Integer, nullable=False)
    
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("Answer", back_populates="question", uselist=False)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_audio_text = Column(Text, nullable=True) # The transcribed text
    
    question = relationship("Question", back_populates="answer")
    feedback = relationship("Feedback", back_populates="answer", uselist=False)

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("answers.id"))
    evaluation_json = Column(JSON, nullable=True) # Full evaluation data
    score = Column(Integer, nullable=True) # Specific score for this answer

    answer = relationship("Answer", back_populates="feedback")
