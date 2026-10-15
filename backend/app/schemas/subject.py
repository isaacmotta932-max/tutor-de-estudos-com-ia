from pydantic import BaseModel


class Subject(BaseModel):
    id: str
    name: str
    icon: str
    description: str
