import bcrypt

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password, hash):
    return bcrypt.checkpw(password.encode(), hash.encode())
