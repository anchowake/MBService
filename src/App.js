import { useEffect, useState } from 'react';
import './App.css';
import Axios from 'axios';
import Chart from "react-google-charts";

const movementsData = require('./dummy/movements.json');
const accountsData = require('./dummy/accounts.json');
const dateOptions = {
  year: 'numeric',
  month: 'long',
}

function App() {
  const [movementsByMonth, setMovementsByMonth] = useState({});
  const [pieData, setPieData] = useState([]);


  useEffect(async () => {
    const movementsByMonthCopy = movementsByMonth;

    const options = {
      url: 'https://banking.sandbox.prometeoapi.com/login/',
      method: 'POST',
      mode: 'cors',
      body: `provider=${process.env.REACT_APP_provider}&username=${process.env.user}&password=${process.env.pwd}&type=`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': `${process.env.REACT_APP_API}`,
        'Access-Control-Allow-Origin': '*',
      },
    };

    /* Getting Blocke by CORS */
    // let response = await Axios(options);
    // let responseOK = response && response.status === 200 && response.statusText === 'OK';
    // if (responseOK) {
    //   let data = await response.data;
    //   console.log(data)
    // }

    //console.log(movementsData)

    movementsData.movements.forEach((movement) => {
      const newDataFormat = changeDateFormat(movement.date)
      const movementDate = new Date(newDataFormat).toLocaleDateString('en-US', dateOptions);

      let monthExist = movementsByMonthCopy.hasOwnProperty(movementDate);

      if (!monthExist) {
        movementsByMonthCopy[movementDate] = { total: 0 };
      }

      movementsByMonthCopy[movementDate].total = movement.debit + parseFloat(movementsByMonthCopy[movementDate].total);

    });

    setMovementsByMonth(movementsByMonthCopy);
    setupPiechart()
  }, [movementsByMonth])

  const changeDateFormat = (dateString) => {
    const dateParts = dateString.split('/');
    const newDateObj = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

    return newDateObj;
  };

  const setupPiechart = () => {
    const pieDataCopy = pieData;

    Object.entries(movementsByMonth).forEach(([key, value]) => {
      pieDataCopy.push([key, parseFloat(value.total, 10)])
    });

    pieDataCopy.unshift(['Month', 'Expenses'])

    setPieData(pieDataCopy);
  };


  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome {process.env.REACT_APP_user}!</p>

        <Chart
          width={'100%'}
          height={'550px'}
          chartType="PieChart"
          loader={<div>Loading Chart</div>}
          data={pieData}
          options={{
            title: 'Monthly Expenses',
            // Just add this option
            pieHole: 0.2,
          }}
          rootProps={{ 'data-testid': '3' }}
        />

      </header>
    </div>
  );
}

export default App;
