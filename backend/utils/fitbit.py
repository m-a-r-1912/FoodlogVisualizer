import requests
import json
import os
from django.conf import settings
from urllib.parse import urljoin
from datetime import datetime, timedelta
from logging import getLogger

class FitBitClient():
    def __init__(self, fitbit_key):
        self.fitbit_key = fitbit_key
        self.default_headers = {'Authorization' : f"Bearer {self.fitbit_key}",
                                'Content-Type' : 'application/json'
                                }
        self.session = requests.Session()
        self.session.headers.update(self.default_headers)
        self.FITBIT_BASE_URL = "https://api.fitbit.com/1/user/-/"
        self.logger = getLogger(__name__)
    
    #Get foodlog data
    def get_foodlog(self, days_back):
        all_foodlog_data = []
      
        today = datetime.now()

        delta = timedelta(days=days_back)
        end_date = today
        start_date = today-delta

        #"paginate" the FitBit API to get the days foodlogs
        while start_date <= end_date:
            formatted_date = self.format_date(start_date)
            retrieval_url = urljoin(self.FITBIT_BASE_URL, f"foods/log/date/{formatted_date}.json")
            self.logger.info("Retrieving data for date: %s", formatted_date)

            try:
                response = self.session.get(retrieval_url)
                response.raise_for_status()

                json_obj = json.loads(response.text)
                if json_obj['foods']:
                    summary = json_obj['summary']
                    log_date = json_obj['foods'][0]['logDate']
                    summary['logDate'] = log_date
                    all_foodlog_data.append(summary)

            except requests.exceptions.RequestException as e:
                self.logger.error("Error retrieving data for date %s: %s", formatted_date, str(e), exc_info=True)
                if hasattr(e, "response") and e.response is not None:
                    if e.response.status_code == 401:
                        #TODO: look into better error handling class
                        raise ValueError("Received unauthorized error. Logout and log back in again.", 401);
            start_date += timedelta(days=1)

        filename = "foodlog.json"
        foldername = "fitbit_data"

        file_path = os.path.join(settings.BASE_DIR, foldername, filename)

        #create folder
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)

        #writing out the data to file for the page hosted by the frontend app
        with open(file_path, "w") as file:
            json.dump(all_foodlog_data, file)

        #returning the data for the page hosted by the backend app
        # json_data = json.dumps(all_foodlog_data)
        # return json_data

    def format_date(self, date_obj):
        return date_obj.strftime("%Y-%m-%d")
    

