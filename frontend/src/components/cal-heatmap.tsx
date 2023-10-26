import CalHeatmap from 'cal-heatmap';
import Tooltip from 'cal-heatmap/plugins/Tooltip';
import 'cal-heatmap/cal-heatmap.css';
import axios from "axios";
import React, {useEffect, useState} from 'react';

export default function Cal() {
  //TODO: look into how to make proxying compatible with this frontend setup
  //(so that the full URL doesn't have to be used)
  const data_url = 'http://localhost:8000/api/data?format=json';
  const [foodlog, setFoodlog] = useState([]);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [fitbitDataLoaded, setFitbitDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await axios.get(data_url);
        setFoodlog(response.data.foodlog);
        setLow(response.data.analytics.min_value);
        setHigh(response.data.analytics.max_value);
        setFitbitDataLoaded(true);
      } catch (error){
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, []);

  useEffect (() => {
    if (process.browser && fitbitDataLoaded) {
      const cal = new CalHeatmap();
      cal.paint(
        {
          data: {
            source: foodlog,
            type: 'json',
            x: 'logDate',
            y: d => +d['sodium'],
            groupY: 'max',
          },
          range: 4,
          date: { start: new Date('2023-07-06') },
          scale: {
            color: {
              type: 'quantize',
              domain: [low, high],
              scheme: 'YlOrRd',
            },
          },
          domain: {
            type: 'month',
            gutter: 4,
            label: { text: 'MMM', textAlign: 'start', position: 'top' },
          },
          subDomain: { type: 'ghDay', radius: 2, width: 20, height: 20, gutter: 4 },
  
        },
        [
          [
            Tooltip,
            {
              text: function (date, value, dayjsDate) {
                return (
                  (value ? value + ' mg' : 'No data') + ' on ' + dayjsDate.format('LL')
                );
              },
            },
          ],
        ]
       
      );
    }
  }, [foodlog, low, high]);

  return <div id="cal-heatmap"></div>;
}
