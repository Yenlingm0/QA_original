from unittest import TestCase, main
from pymeter.api.config import TestPlan, ThreadGroupWithRampUpAndHold
from pymeter.api.postprocessors import JsonExtractor
from pymeter.api.reporters import HtmlReporter
from pymeter.api.samplers import DummySampler, HttpSampler
from pymeter.api.timers import UniformRandomTimer

from PyAES import CAES, KeySize
from QA import AES_Payload, Detect, Start
import uuid
import socket
import time
import threading
import random
import os
os.environ['JAVA_HOME'] = 'C:\Program Files\Java\jdk-20\bin'

UUID = (str(uuid.uuid4()).replace('-','')).ljust(36,'\0')
data_list = [
    AES_Payload('GiveInfo',UUID,'000',''),
    AES_Payload('GiveDetectInfoFirst',UUID,'0|0',''),
    AES_Payload('GiveDetectInfo',UUID,'0|0',''),
    AES_Payload('CheckConnect',UUID,'000','')   
    
]


class TestTestPlanClass(TestCase):
    def test_1(self):
        json_extractor = JsonExtractor("variable", "args.var")
        timer = UniformRandomTimer(1000, 2000)
        # for data in data_list:
        #         response = HttpSampler.post(data, json)
        #         # 在這裡處理 response，可以印出回應或進行其他操作
        #         print(response.status_code)
        #         print(response.json())   
                
        http_sampler = HttpSampler(
            "Echo",
            "192.168.200.132",
            timer,
            json_extractor,
        )
        tg = ThreadGroupWithRampUpAndHold(
            1, 1, 2, http_sampler, name="Some Name"
        )
        html_reporter = HtmlReporter()
        tp = TestPlan(tg, html_reporter)
        stats = tp.run()
        # print(
        #     f"duration= {stats.duration_milliseconds}",
        #     f"mean= {stats.sample_time_mean_milliseconds}",
        #     f"min= {stats.sample_time_min_milliseconds}",
        #     f"median= {stats.sample_time_median_milliseconds}",
        #     f"90p= {stats.sample_time_90_percentile_milliseconds}",
        #     f"95p= {stats.sample_time_95_percentile_milliseconds}",
        #     f"99p= {stats.sample_time_99_percentile_milliseconds}",
        #     f"max= {stats.sample_time_max_milliseconds}",
        #     sep="\t",
        # )
        self.assertLess(stats.sample_time_99_percentile_milliseconds, 5000)


if __name__ == "__main__":
    main()
