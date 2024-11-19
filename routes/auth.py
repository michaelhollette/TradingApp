from fastapi import Depends, HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from starlette import status

from db import get_session
from schemas import User, UserOutput

URL_PREFIX = "/auth"
router = APIRouter(prefix=URL_PREFIX, tags=["Authentication"])

#OAuth serves many use cases, client that is trying to get access, could be served from another domain
# OAuth will send the user credential to the token url - which could be served from another server
# If the credentials are ok, client will get a token from the url which will be used to asccess the operation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token") # returns a token


def get_current_user(token: str = Depends(oauth2_scheme),
                     session: Session = Depends(get_session)) -> User:
    # Checks if user exists
    query = select(User).where(User.username == token)
    user = session.exec(query).first()
    if user:
        return user
    else:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Username or password incorrect",
            headers = {"WWW-Authenticate": "Bearer"},
        )
 

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), # No argument - fastapi will try to create the object and will get us the form data from the request
                session: Session = Depends(get_session)):
    query = select(User). where(User.username == form_data.username) # queries database for user
    user = session.exec(query).first()
    if user and user.verify_password(form_data.password):
        return { "access_token": user.username, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code= 400,
            detail="Incorrect username or password"
        )

   
@router.post("/register")
async def register(username: str, password: str, session: Session = Depends(get_session)):
    # Check if the username already exists
    query = select(User).where(User.username == username)
    existing_user = session.exec(query).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    # Create a new user
    new_user = User(username=username)
    new_user.set_password(password)  # Hash the password
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "User registered successfully", "username": new_user.username}


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    # For stateless tokens, "logout" is effectively handled client-side by removing the token.
    return {"message": "Successfully logged out"}

@router.get("/me", response_model = UserOutput)
async def get_current_user_route(current_user: UserOutput = Depends(get_current_user)):
    return current_user
