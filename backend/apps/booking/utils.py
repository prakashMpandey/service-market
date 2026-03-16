import math
import random

def generate_otp():
    otp=""

    for i in range (0,4):
        otp+=str(random.randint(0,9))
    
    return otp


