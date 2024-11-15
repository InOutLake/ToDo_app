from pydantic import BaseModel
from app.database.db import TaskStatus


class TaskBase(BaseModel):
    name: str
    description: str | None = None
    status: TaskStatus = TaskStatus.TO_DO


class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True


class TaskPut(TaskBase):
    name: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
