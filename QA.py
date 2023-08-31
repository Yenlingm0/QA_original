from PyAES import CAES, KeySize
import uuid
import socket
import time
import threading
import random

def AES_Payload(Task,UUID,check,Data):
        AESKey = "AES Encrypt Decrypt"
        myAES = CAES()
        myAES.SetKeys(KeySize.BIT128, AESKey)

        MAC = '\0'*20
        IP = '\0'*20
        DoWorking = Task.ljust(24,'\0')
        if check == '000':
                csMsg = '\0'*(924)
        elif check == '0|0':
                #csMsg = '0|0'
                csMsg = '0|0'+'\0'*921
        elif check == 'Network':
                csMsg = Data.ljust(65435,'\0')
        elif check == 'Information':
                csMsg = Data.ljust(65435,'\0')
        elif check == 'History':
                csMsg = Data.ljust(65435,'\0')
        elif check == 'Risk':
                csMsg = Data.ljust(65435,'\0')
        else:
                print('Error!')

        payload = []

        payload += MAC+IP+UUID+DoWorking+csMsg

        encrypt = myAES.EncryptBuffer(payload)

        data_list = [ord(data) for data in encrypt]

        return bytearray(data_list)

# def AES_encrypt(UUID,request):
        
#         UUID = (str(uuid.uuid4()).replace('-','')).ljust(36,'\0')

#         payload1 = AES_Payload('GiveInfo',UUID,'000','')
#         #print('Giveinfo=',payload)
#         request.send(payload1)
#         #print('GiveInfo Send!')
#         #print('GiveInfo_Response:')
#         response1 = request.recv(1024)
#         if response1 == '':
#                 return 0
#         #print(AES_decrypt(response))

#         payload2 = AES_Payload('GiveDetectInfoFirst',UUID,'0|0','')
#         request.send(payload2)
#         #print('GiveDetectInfoFirst Send!')
#         #print('GiveDetectInfoFirst_Response:')
#         response2 = request.recv(1024)
#         #print(AES_decrypt(response))

#         payload3 = AES_Payload('GiveDetectInfo',UUID,'0|0','')

#         request.send(payload3)
#         #print('GiveDetectInfo_Send!')

#         payload4 = AES_Payload('CheckConnect',UUID,'000','')
        

def AES_decrypt(Task):
        AESKey = "AES Encrypt Decrypt"
        myAES = CAES()
        myAES.SetKeys(KeySize.BIT128, AESKey)

        data_list = [chr(data) for data in Task]

        decrypt_text = myAES.DecryptBuffer(data_list)

        return ''.join(decrypt_text)

def Keep_Connect(request,payload):
        for i in range(50):
                request.send(payload)
                print('Alive...')
                time.sleep(20)
#               print(f"存活的執行緒數量：{threading.active_count()}")
        request.close()

def Detect(UUID,Data,RD,request):
        if RD == 0:
                network_payload_First = AES_Payload('GiveNetworkHistory',UUID,'000','')
                time.sleep(1)
                request.send(network_payload_First)
                response = request.recv(1024)
                #print(AES_decrypt(response))

                network_payload = AES_Payload('GiveNetworkHistoryEnd',UUID,'Network',Data)
                time.sleep(1)
                request.send(network_payload)
                response = request.recv(1024)
                if response == '':
                        request.close()
                        return 0

        elif RD == 1:
                information_payload_First = AES_Payload('GiveProcessInformation',UUID,'000','')
                time.sleep(1)
                request.send(information_payload_First)
                response = request.recv(1024)
                #print(AES_decrypt(response))

                information_payload = AES_Payload('GiveProcessInfoEnd',UUID,'Information',Data)
                time.sleep(1)
                request.send(information_payload)
                response = request.recv(1024)
                #print(AES_decrypt(response))
                if response == '':
                        request.close()
                        return 0


        elif RD == 2:
                history_payload_First = AES_Payload('GiveProcessHistory',UUID,'000','')
                time.sleep(1)
                request.send(history_payload_First)
                response = request.recv(1024)
                #print(AES_decrypt(response))

                history_payload = AES_Payload('GiveProcessHistoryEnd',UUID,'History',Data)
                time.sleep(1)
                request.send(history_payload)
                response = request.recv(1024)
                #print(AES_decrypt(response)) 
                if response == '':
                        request.close()
                        return 0


        elif RD == 3:
                risk_payload_First = AES_Payload('GiveDetectProcessRisk',UUID,'000','')
                time.sleep(1)
                request.send(risk_payload_First)
                response = request.recv(1024)
                #print(AES_decrypt(response))

                risk_payload = AES_Payload('GiveDetectProcessOver',UUID,'Risk',Data)
                time.sleep(1)
                request.send(risk_payload)
                response = request.recv(1024)
                #print(AES_decrypt(response))

                risk_payload_End = AES_Payload('GiveDetectProcessEnd',UUID,'000','')
                time.sleep(1)
                request.send(risk_payload_End)
                response = request.recv(1024)
                #print(AES_decrypt(response))
                if response == '':
                        request.close()
                        return 0



def Start():
        target_ip = '192.168.200.132'
        target_port = 1988
        target = (target_ip,target_port)

        Network_Data = open('Network.txt','r') # r-讀取
        Network_Data = Network_Data.read()     # GiveNetworkHistoryEnd

        Information_Data = open('Information.txt','r') # GiveProcessInfoEnd
        Information_Data = Information_Data.read()

        History_Data = open('History.txt','r') # Detect記憶體-GiveProcessHistoryEnd
        History_Data = History_Data.read()

        Risk_Data = open('Risk.txt','r') # GiveDetectProcessOver
        Risk_Data = Risk_Data.read()

        request = socket.socket()
        request.connect((target))

        UUID = (str(uuid.uuid4()).replace('-','')).ljust(36,'\0')

        payload = AES_Payload('GiveInfo',UUID,'000','')
        #print('Giveinfo=',payload)

        request.send(payload)
        #print('GiveInfo Send!')

        #print('GiveInfo_Response:')
        response = request.recv(1024)
        if response == '':
                return 0
        #print(AES_decrypt(response))

        payload = AES_Payload('GiveDetectInfoFirst',UUID,'0|0','')
        request.send(payload)
        #print('GiveDetectInfoFirst Send!')

        #print('GiveDetectInfoFirst_Response:')
        response = request.recv(1024)
        #print(AES_decrypt(response))

        payload = AES_Payload('GiveDetectInfo',UUID,'0|0','')

        request.send(payload)
        #print('GiveDetectInfo_Send!')

        payload = AES_Payload('CheckConnect',UUID,'000','')

        #KC = threading.Thread(target=Keep_Connect,args=(request,payload,))
        #KC.start()

        for i in range(1000):
                RD = random.randint(0,3)
                if RD == 0:
                        Detect(UUID,Network_Data,0,request)
                elif RD == 1:
                        Detect(UUID,Information_Data,1,request)
                elif RD == 2:
                        Detect(UUID,History_Data,2,request)
                elif RD == 3:
                        Detect(UUID,Risk_Data,3,request)
                else:
                        print('Error!')
                time.sleep(3)
                print(f"存活的執行緒數量：{threading.active_count()}")

for i in range(1,5): #Only Hand Shake: 1022
        test = threading.Thread(target=Start)
        test.start()
        time.sleep(0.2)


#GOGOGO()
#request.close()

print('end')
