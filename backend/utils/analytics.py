import json
from logging import getLogger
from statistics import mean

class Analytics ():

    #souce: https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet
    RECOMMENDED_SODIUM_MG = 2_300
    #source: https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/carbohydrates/art-20045705
    RECOMMENDED_CARB_MAX_PERCENT = 65
    #source: https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels
    RECOMMENDED_FAT_G = 78

    def __init__(self, nutrient_metric, foodlog_data):
        self.nutrient_metric = nutrient_metric
        self.logger = getLogger(__name__)
        self.foodlog_data = foodlog_data
    
    def get_standard_analytics(self):
        #TODO: need to make the analytics dependent on the nutrient metric selected
        total_num_days = len(self.foodlog_data)
        max_value = max(day['sodium'] for day in self.foodlog_data)
        min_value = min(day['sodium'] for day in self.foodlog_data)
        avg_value = mean(day['sodium'] for day in self.foodlog_data)

        num_days_exceeding = len([day for day in self.foodlog_data if day['sodium'] > self.RECOMMENDED_SODIUM_MG])
    
        exceeding_days_percentage = 0.0
        if total_num_days > 0:
            exceeding_days_percentage = (num_days_exceeding / total_num_days) * 100
        
        return {
            'max_value': max_value,
            'min_value': min_value,
            'avg_value': avg_value,
            'exceeding_days_percentage': exceeding_days_percentage
        }