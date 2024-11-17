from fastapi import FastAPI, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import db as database
from app.schemas import Task

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


@app.get("/")
async def homepage(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request}, media_type="text/html"
    )


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/tasks/", response_model=Task.Task)
def create_task(task: Task.TaskBase, db: Session = Depends(get_db)):
    db_task = database.Task(
        name=task.name, description=task.description, status=task.status
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.get("/tasks/", response_model=list[Task.Task])
def read_tasks(db: Session = Depends(get_db)):
    return db.query(database.Task).all()


@app.get("/tasks/{task_id}", response_model=Task.Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    return db.query(database.Task).filter(database.Task.id == task_id).first()


@app.put("/tasks/{task_id}", response_model=Task.Task)
def update_task(task_id: int, task: Task.TaskPut, db: Session = Depends(get_db)):
    db_task = db.query(database.Task).filter(database.Task.id == task_id).first()
    if task.name:
        db_task.name = task.name
    if task.description:
        db_task.description = task.description
    if task.status:
        db_task.status = task.status
    db.commit()
    db.refresh(db_task)
    return db_task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(database.Task).filter(database.Task.id == task_id).first()
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}
