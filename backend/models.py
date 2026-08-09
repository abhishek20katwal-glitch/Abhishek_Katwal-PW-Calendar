from sqlalchemy import Column, Integer, String, ForeignKey, DateTime

from database import Base


# =========================================================
# BATCH
# =========================================================

class Batch(Base):

    __tablename__ = "batches"

    id = Column(
        Integer,
        primary_key=True
    )

    batch_name = Column(
        String,
        nullable=False
    )

    class_name = Column(
        String,
        nullable=False
    )

    center = Column(
        String,
        nullable=False
    )

    academic_year = Column(
        String,
        nullable=False
    )


# =========================================================
# FACULTY
# =========================================================

class Faculty(Base):

    __tablename__ = "faculty"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(
        String,
        nullable=False
    )

    subject = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=True
    )


# =========================================================
# CLASS SCHEDULE
# =========================================================

class ClassSchedule(Base):

    __tablename__ = "classes"

    id = Column(
        Integer,
        primary_key=True
    )

    batch_id = Column(
        Integer,
        ForeignKey("batches.id"),
        nullable=False
    )

    faculty_id = Column(
        Integer,
        ForeignKey("faculty.id"),
        nullable=True
    )

    subject = Column(
        String,
        nullable=False
    )

    start_time = Column(
        DateTime,
        nullable=False
    )

    end_time = Column(
        DateTime,
        nullable=False
    )