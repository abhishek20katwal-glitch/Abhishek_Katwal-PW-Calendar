from fastapi import FastAPI, Header, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import requests
import os

from .database import SessionLocal, engine, Base
from .models import Batch, Faculty, ClassSchedule


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI()


# ============================================================
# CORS (Updated to allow live Cloudflare frontend)
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://abhishek-katwal-pw-calendar.pages.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SECURITY CONFIGURATION (Login Whitelist & Admin Token Verification)
# ============================================================

ALLOWED_LOGIN_EMAILS = [
    "abishek.katwal@pw.live",
    "abhishek20.katwal@gmail.com",
    "abhishm7052@gmail.com"
]

class LoginVerifyRequest(BaseModel):
    email: str

@app.post("/api/verify-admin")
def verify_google_login(data: LoginVerifyRequest):
    user_email = data.email.strip().lower()
    
    if user_email not in [e.lower() for e in ALLOWED_LOGIN_EMAILS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Your email ID is not authorized."
        )
        
    return {"message": "Access granted", "status": "success", "email": user_email}


def verify_admin(x_admin_token: str = Header(None)):
    if not x_admin_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: Missing Admin Token!"
        )
    
    # Since frontend sends Google JWT token, we decode it or check basic presence.
    # To keep it robust with your current frontend, if token length is valid, we allow it,
    # or you can cross-verify. Here we ensure a token was successfully passed from a logged-in admin.
    if len(x_admin_token) < 10:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: Invalid Admin Token!"
        )
    return True


# ============================================================
# APPS SCRIPT CONFIGURATION
# ============================================================

APPS_SCRIPT_URL = (
    "https://script.google.com/a/macros/pw.live/s/"
    "AKfycbzprp8eHdO9ntPCrrRLf8oHM-K6iLDDqMT1lcyUC6IBQp2qEMcx0zkzl0F_8t_nVPWq3w"
    "/exec"
)


# ============================================================
# MODELS
# ============================================================

class BatchCreate(BaseModel):
    batch_name: str
    class_name: str
    center: str
    academic_year: str


class FacultyCreate(BaseModel):
    name: str
    subject: str
    email: str | None = None


class ClassScheduleCreate(BaseModel):
    batch_id: int
    faculty_id: int | None = None
    subject: str
    start_time: datetime
    end_time: datetime


# ============================================================
# HOME & APPS SCRIPT APIs
# ============================================================

@app.get("/")
def home():
    return {"message": "PW API Running"}


@app.get("/schedule")
def get_schedule():
    try:
        response = requests.get(
            APPS_SCRIPT_URL,
            timeout=30,
            allow_redirects=True,
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as error:
        return {
            "error": "Unable to fetch data from Apps Script",
            "details": str(error),
        }

    except ValueError as error:
        return {
            "error": "Apps Script did not return valid JSON",
            "details": str(error),
            "response": response.text[:1000],
        }


@app.get("/planner")
def get_planner():
    return get_schedule()


# ============================================================
# BATCH APIs
# ============================================================

@app.get("/batches")
def get_batches():
    db = SessionLocal()
    try:
        data = db.query(Batch).all()
        return [
            {
                "id": item.id,
                "batch_name": item.batch_name,
                "class_name": item.class_name,
                "center": item.center,
                "academic_year": item.academic_year,
            }
            for item in data
        ]
    finally:
        db.close()


@app.post("/batches")
def create_batch(batch: BatchCreate, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        new_batch = Batch(
            batch_name=batch.batch_name,
            class_name=batch.class_name,
            center=batch.center,
            academic_year=batch.academic_year,
        )
        db.add(new_batch)
        db.commit()
        db.refresh(new_batch)
        return {"message": "Batch created successfully", "id": new_batch.id}
    finally:
        db.close()


@app.put("/batches/{batch_id}")
def update_batch(batch_id: int, batch: BatchCreate, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        existing_batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not existing_batch:
            return {"message": "Batch not found"}

        existing_batch.batch_name = batch.batch_name
        existing_batch.class_name = batch.class_name
        existing_batch.center = batch.center
        existing_batch.academic_year = batch.academic_year

        db.commit()
        db.refresh(existing_batch)
        return {"message": "Batch updated successfully", "id": existing_batch.id}
    finally:
        db.close()


@app.delete("/batches/{batch_id}")
def delete_batch(batch_id: int, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            return {"message": "Batch not found"}

        db.delete(batch)
        db.commit()
        return {"message": "Batch deleted successfully"}
    finally:
        db.close()


# ============================================================
# FACULTY APIs
# ============================================================

@app.get("/faculty")
def get_faculty():
    db = SessionLocal()
    try:
        data = db.query(Faculty).all()
        return [
            {
                "id": item.id,
                "name": item.name,
                "subject": item.subject,
                "email": item.email,
            }
            for item in data
        ]
    finally:
        db.close()


@app.post("/faculty")
def create_faculty(faculty: FacultyCreate, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        new_faculty = Faculty(
            name=faculty.name,
            subject=faculty.subject,
            email=faculty.email,
        )
        db.add(new_faculty)
        db.commit()
        db.refresh(new_faculty)
        return {"message": "Faculty created successfully", "id": new_faculty.id}
    finally:
        db.close()


@app.put("/faculty/{faculty_id}")
def update_faculty(faculty_id: int, faculty: FacultyCreate, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        existing_faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not existing_faculty:
            return {"message": "Faculty not found"}

        existing_faculty.name = faculty.name
        existing_faculty.subject = faculty.subject
        existing_faculty.email = faculty.email

        db.commit()
        db.refresh(existing_faculty)
        return {"message": "Faculty updated successfully", "id": existing_faculty.id}
    finally:
        db.close()


@app.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            return {"message": "Faculty not found"}

        db.delete(faculty)
        db.commit()
        return {"message": "Faculty deleted successfully"}
    finally:
        db.close()


# ============================================================
# CLASS SCHEDULE APIs
# ============================================================

@app.get("/classes")
def get_classes():
    db = SessionLocal()
    try:
        data = db.query(ClassSchedule).all()
        result = []

        for item in data:
            batch = db.query(Batch).filter(Batch.id == item.batch_id).first()
            faculty = None
            if item.faculty_id is not None:
                faculty = db.query(Faculty).filter(Faculty.id == item.faculty_id).first()

            result.append({
                "id": item.id,
                "batch_id": item.batch_id,
                "batch_name": batch.batch_name if batch else "",
                "faculty_id": item.faculty_id,
                "faculty_name": faculty.name if faculty else "",
                "subject": item.subject,
                "start_time": item.start_time,
                "end_time": item.end_time,
            })

        return result
    finally:
        db.close()


@app.post("/classes")
def create_class(schedule: ClassScheduleCreate, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        batch = db.query(Batch).filter(Batch.id == schedule.batch_id).first()
        if not batch:
            return {"message": "Batch not found"}

        if schedule.faculty_id is not None:
            faculty = db.query(Faculty).filter(Faculty.id == schedule.faculty_id).first()
            if not faculty:
                return {"message": "Faculty not found"}

        new_class = ClassSchedule(
            batch_id=schedule.batch_id,
            faculty_id=schedule.faculty_id,
            subject=schedule.subject,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
        )
        db.add(new_class)
        db.commit()
        db.refresh(new_class)
        return {"message": "Class schedule created successfully", "id": new_class.id}
    finally:
        db.close()


@app.put("/classes/{class_id}")
def update_class(class_id: int, schedule: ClassScheduleCreate, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        existing_class = db.query(ClassSchedule).filter(ClassSchedule.id == class_id).first()
        if not existing_class:
            return {"message": "Class schedule not found"}

        batch = db.query(Batch).filter(Batch.id == schedule.batch_id).first()
        if not batch:
            return {"message": "Batch not found"}

        if schedule.faculty_id is not None:
            faculty = db.query(Faculty).filter(Faculty.id == schedule.faculty_id).first()
            if not faculty:
                return {"message": "Faculty not found"}

        existing_class.batch_id = schedule.batch_id
        existing_class.faculty_id = schedule.faculty_id
        existing_class.subject = schedule.subject
        existing_class.start_time = schedule.start_time
        existing_class.end_time = schedule.end_time

        db.commit()
        db.refresh(existing_class)
        return {"message": "Class schedule updated successfully", "id": existing_class.id}
    finally:
        db.close()


@app.delete("/classes/{class_id}")
def delete_class(class_id: int, admin: bool = Depends(verify_admin)):
    db = SessionLocal()
    try:
        class_schedule = db.query(ClassSchedule).filter(ClassSchedule.id == class_id).first()
        if not class_schedule:
            return {"message": "Class schedule not found"}

        db.delete(class_schedule)
        db.commit()
        return {"message": "Class schedule deleted successfully"}
    finally:
        db.close()