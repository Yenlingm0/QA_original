from PyAES import CAES, KeySize
import uuid
import socket
import time
import threading
import random
import tkinter

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



def GOGOGO(Thread_request):
        Start['state'] = tkinter.DISABLED
        target_ip = '192.168.200.132'
        target_port = 1988
        target = (target_ip,target_port)

        stop_flag = 0
        try:
                Network_Data = open(NetworkFile.get(),'r')
                Network_Data = Network_Data.read()
        except:
                InformationText.insert('Can not find NetworkHistory File.')
                return 0
        try:
                Information_Data = open(ProcessInformationFile.get(),'r')
                Information_Data = Information_Data.read()
        except:
                InformationText.insert('Can not find ProcessInformation File.')
                return 0
        try:
                History_Data = open(HistoryFile.get(),'r')
                History_Data = History_Data.read()
        except:
                InformationText.insert('Can not find ProcessHistory File.')
                return 0
        try:
                Risk_Data = open(RiskFile.get(),'r')
                Risk_Data = Risk_Data.read()
        except:
                InformationText.insert('Can not find DetectProcessRisk File.')
                return 0

        request = socket.socket()
        request.connect((target))

        UUID = (str(uuid.uuid4()).replace('-','')).ljust(36,'\0')

        payload = AES_Payload('GiveInfo',UUID,'000','')

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
        #print(f"存活的執行緒數量(RD)：{threading.active_count()}")

        for i in range(Thread_request):
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
                information_Text.insert('end',f"alive：{threading.active_count()}\n")
                information_Text.see('end')
        Start['state'] = tkinter.NORMAL

def GOGOGO_count():
        try:
                count = int(Thread_count.get())
                request_count = int(Thread_request.get())
                information_Text.insert('end','Start!\n')
                information_Text.see('end')
        except:
                information_Text.insert('end','input error!\n')
                information_Text.see('end')
        for i in range(1,count):
                start = threading.Thread(target=GOGOGO,args=(request_count,))
                start.start()


windows = tkinter.Tk()
windows.title('QA')
windows.geometry('500x500')

Start = tkinter.Button(text="start",command=lambda:threading.Thread(target=GOGOGO_count).start())
Start.pack(side='bottom')
Thread_count_Text = tkinter.Label(text='number of threads:')
Thread_count_Text.place(x=0)
Thread_count = tkinter.Entry()
Thread_count.place(x=140,width=75,height=25)
Thread_count.insert('end','10')

Thread_request_Text = tkinter.Label(text='How many times does a thread execute detect?:')
Thread_request_Text.place(x=0,y=30)
Thread_request = tkinter.Entry()
Thread_request.place(x=330,y=30,width=75,height=25)
Thread_request.insert('end','10')

information_Text = tkinter.Text()
information_Text.place(y=200,height=100)
information_Text.insert('end','Now the default number of threads is: 10\n')
information_Text.insert('end','Now the preset number of executions per thread is: 10\n')

Network_Label = tkinter.Label(text='GiveNetworkHistory File:')
Network_Label.place(x=0,y=60)
NetworkFile = tkinter.Entry()
NetworkFile.place(x=180,y=60)
NetworkFile.insert('end','Network.txt')

ProcessInformation_Label = tkinter.Label(text='GiveProcessInformation File:')
ProcessInformation_Label.place(x=0,y=90)
ProcessInformationFile = tkinter.Entry()
ProcessInformationFile.place(x=200,y=90)
ProcessInformationFile.insert('end','Information.txt')

History_Label = tkinter.Label(text='GiveProcessHistory File:')
History_Label.place(x=0,y=120)
HistoryFile = tkinter.Entry()
HistoryFile.place(x=180,y=120)
HistoryFile.insert('end','History.txt')

Risk_Label = tkinter.Label(text='GiveDetectProcessRisk File:')
Risk_Label.place(x=0,y=150)
RiskFile = tkinter.Entry()
RiskFile.place(x=200,y=150)
RiskFile.insert('end','Risk.txt')


windows.mainloop()

#for i in range(1,1): #Only Hand Shake: 1022
#       test = threading.Thread(target=GOGOGO)
#       test.start()
#       time.sleep(0.2)
#print(f"存活的執行緒數量：{threading.active_count()}")

#GOGOGO()
#request.close()

#print('end')