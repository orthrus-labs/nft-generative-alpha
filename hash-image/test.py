import hashlib
import os

os.remove("readme.txt")

    
for x in range(1, 101):
     print(x)
     filename = "../generateNFT/images/{}.png".format(x)
     with open(filename,"rb") as f:
            bytes = f.read() # read entire file as bytes
            readable_hash = hashlib.sha256(bytes).hexdigest();
            print(readable_hash)
            with open('readme.txt', 'a') as f:
                f.write(readable_hash)


filename = "./readme.txt"
with open(filename,"rb") as f:
    bytes = f.read() # read entire file as bytes
    print(bytes)
    readable_hash = hashlib.sha256(bytes).hexdigest();
    print('\n\n ---Provenance Hash---')
    print(readable_hash)
    with open('provenance.txt', 'a') as f:
        f.write(readable_hash)
