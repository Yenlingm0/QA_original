import uuid
from PyAES import CAES, KeySize

GiveInfo = vars.get("GiveInfo")

UUID = (str(uuid.uuid4()).replace('-','')).ljust(36,'\0')

def AES_Payload(Task,UUID,check,Data):
        AESKey = "AES Encrypt Decrypt"
        myAES = CAES()
        myAES.SetKeys(KeySize.BIT128, AESKey)

        MAC = '\0'*20
        IP = '\0'*20
        DoWorking = Task.ljust(24,'\0')


        payload = []

        payload += MAC+IP+UUID+DoWorking+csMsg

        encrypt = myAES.EncryptBuffer(payload)

        data_list = [ord(data) for data in encrypt]

        return (data_list)

GiveInfoRespond = AES_Payload('GiveInfo',UUID,'000','')
vars.put("GiveInfoRespond", GiveInfoRespond)