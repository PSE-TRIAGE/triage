import bcrypt

def hash_password():
    print(bcrypt.hashpw("admin".encode(), bcrypt.gensalt()).decode())

hash_password()

