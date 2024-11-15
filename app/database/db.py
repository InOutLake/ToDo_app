from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Enum as sEnum
from enum import Enum


SQLALCHEMY_DATABASE_URL = "sqlite:///tasks.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# TODO: move to enums section
class TaskStatus(Enum):
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


task_status_type = sEnum(TaskStatus, name="task_status_type")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    status = Column(task_status_type, default=TaskStatus.TO_DO)

    def __repr__(self):
        return f"Task(id={self.id}, name={self.name}, description={self.description}, status={self.status})"


Base.metadata.create_all(engine)
