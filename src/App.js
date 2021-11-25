import { useEffect, useState } from 'react';
import './App.css';
import 'bulma/css/bulma.min.css';
import Chart from "react-google-charts";
import { Form, Button, Icon, Card, Media, Image, Heading, Content } from 'react-bulma-components';
// const movementsData = require('./dummy/movements.json');
// const accountsData = require('./dummy/accounts.json');
const dateOptions = {
  year: 'numeric',
  month: 'long',
}

function App() {
  // STATEh
  const [movementsByMonth, setMovementsByMonth] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [session, setSession] = useState({})
  const [username, setUsername] = useState(null);
  const [accountCards, setAccountCards] = useState([])
  const [currentAccount, setCurrentAccount] = useState(null);
  const [categories, setCategories] = useState({});

  // LOGIN COMPONENT
  const handleLogin = (evt) => {
    evt.preventDefault();
    const usr = evt.target[0].value;
    const pwd = evt.target[1].value;

    const url = "https://banking.sandbox.prometeoapi.com/login/";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", process.env.REACT_APP_API);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          setUsername(usr)
          setSession({ key: JSON.parse(xhr.responseText).key })
        }
      }
    };

    const data = `provider=test&username=${usr}&password=${pwd}&type=`;

    xhr.send(data);
  };

  const LoginForm = () => {
    const bankLogo = `${process.env.PUBLIC_URL}/images/logo-INVERT.png`;
    return (
      <form onSubmit={(evt) => handleLogin(evt)}>
        <img width='300px' src={bankLogo}/>
        <Form.Field>
          <Form.Label className='has-text-white'>Username</Form.Label>
          <Form.Control>
            <Form.Input placeholder="Prometeo" name="name" value={username} className='has-text-weight-bold' />
            <Icon align="left">
              <i className="github" />
            </Icon>
          </Form.Control>
        </Form.Field>
        <Form.Field>
          <Form.Label className='has-text-white'>Password</Form.Label>
          <Form.Control>
            <Form.Input placeholder="**********" name="password" type="password" className='has-text-weight-bold' />
            <Icon align="left">
              <i className="github" />
            </Icon>
          </Form.Control>
        </Form.Field>
        <Button.Group>
          <Button fullwidth rounded color="primary" className='has-text-weight-bold' >Login</Button>
        </Button.Group>
      </form>
    );
  };

  // Account Components
  const getAccounts = () => {
    let response = null;
    var url = `https://banking.sandbox.prometeoapi.com/account/?key=${session.key}`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", process.env.REACT_APP_API);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        response = JSON.parse(xhr.responseText);
        setAccountCards(response.accounts);
      }
    };

    xhr.send();
  };

  const renderAccounts = () => {
    if (pieData.length > 0) return null;

    const accountElements = accountCards.map((acc) => {
      const imgSrc = `${process.env.PUBLIC_URL}/images/${acc.currency}.png`;

      return (
        <Card style={{ width: 300, margin: '20px' }}>
          <Card.Content>
            <Media>
              <Media.Item renderAs="figure" align="left">
                <Image
                  size={64}
                  alt={acc.currency}
                  src={imgSrc}
                />
              </Media.Item>
              <Media.Item>
                <Heading size={4} className='has-text-weight-bold'>{acc.name}</Heading>
                <Heading subtitle size={6} className='has-text-weight-bold'>
                  Main currency: {acc.currency}
                </Heading>
              </Media.Item>
            </Media>
            <Content>
              {acc.currency === 'USD' ?
                <Button fullwidth rounded color="primary" className='has-text-weight-bold' accountnumber={acc.number} accountcurrency={acc.currency} onClick={(evt) => handleAccountSteup(evt)}>View Account #{acc.number}</Button>
                :
                <Button fullwidth rounded color="dark" className='has-text-weight-bold' onClick={(evt) => evt.preventDefault()}>Unavailable #{acc.number}</Button>
              }
            </Content>
          </Card.Content>
        </Card>
      );
    });
    return (
      <>
        <p>Welcome {username}!</p>
        <p>Select an account</p>
        {accountElements}
      </>
    )
  };

  // Category Helpers
  const CategorizeMovement = (string) => {
    const TransportationRegEx = new RegExp(/uber|didi|ancap|parking|lime|bike share/gmi);
    const RestaurantesRegEx = new RegExp(/starbucks|chipotle|rest|restaurant|restaurante|pizza|sbarro|cafe|confiteria|las|gourmet|pizzeria|sushi|subway|pita/gmi);
    const PharmacyRegEx = new RegExp(/farma|pharmacy|optica|drugs|homeopa|medico|clinica|life|gym|clinca/gmi);
    const PetRegEx = new RegExp(/pet|veterinaria|vet/gmi);
    const HotelRegEx = new RegExp(/airbnb|aerolinea|aerolineas|hotel|air|aerop|viaje|viajes|terminal|hyatt|internationa/gmi);
    const ServicesRegEx = new RegExp(/grammarly|netflix|youtube|google|face|linkedin|subscription|suscripciones|msft|microsoft|antel|heroku|t-mobile|godaddy|roblox|spotify|dropbox|hadfyx|hosting/gmi)
    const IncomeRegExp = new RegExp(/deposito|sueldos|sueldo|rediva|traspaso|cre|pago|pagos/gmi);
    const ExpensesRegExp = new RegExp(/retiro|dispensador|cobro|cuota|debito|cajero|deb.|factura|cargo/gmi);
    const CurrencyRegExp = new RegExp(/cambiosst|hitbtc/gmi);
    const ShoppingRegExp = new RegExp(/paypal|.com|zara|mac|shop|duty|amazon|mercadopago|bershka|online|tienda|marshalls|edreams|amzn|perfumeria|beauty|lenceria|.co|.ro|boutique/gmi);
    const FoodRegExp = new RegExp(/autoservice|hela|supercenter|supermercado|pedidosya|carniceria|merca|food|panaderia|supermarket|wallgreens|rappi/gmi)
    const entertainmentRegExp = new RegExp(/movie|cine|cinema|cirque|golf|disco/gmi);
    const savingsRegExp = new RegExp(/ahorro|savings|investment/gmi);
    const homeImprovementRegExp = new RegExp(/pintura|ferreteria|home|haus/gmi)

    if (savingsRegExp.test(string)) {
      return 'Savings';
    }

    if (TransportationRegEx.test(string)) {
      return 'Transportation & Gas';
    }

    if (PharmacyRegEx.test(string)) {
      return 'Health';
    }

    if (HotelRegEx.test(string)) {
      return 'Travel';
    }

    if (PetRegEx.test(string)) {
      return 'Pets';
    }

    if (ServicesRegEx.test(string)) {
      return 'Subscriptions and Services'
    }

    if (CurrencyRegExp.test(string)) {
      return 'Currency Exchange'
    }

    if (IncomeRegExp.test(string)) {
      return 'Income'
    }

    if (ExpensesRegExp.test(string)) {
      return 'Payments & Withdrawals'
    }

    if (ShoppingRegExp.test(string)) {
      return 'Shopping'
    }

    if (FoodRegExp.test(string)) {
      return 'Groceries & Food'
    }

    if (entertainmentRegExp.test(string)) {
      return 'Entertainment';
    }

    if (homeImprovementRegExp.test(string)) {
      return 'Home Improvement';
    }

    if (RestaurantesRegEx.test(string)) {
      return 'Restaurants';
    }

    return 'Entertainment';
  };

  // Chart Data 
  const handleAccountSteup = (evt) => {
    evt.preventDefault();
    const selectedAccount = evt.target.getAttribute('accountnumber');
    const selectedCurrency = evt.target.getAttribute('accountcurrency');
    const termsDictionary = {};

    var url = `https://banking.sandbox.prometeoapi.com/account/${selectedAccount}/movement/?currency=${selectedCurrency}&date_start=01%2F08%2F2021&date_end=01%2F11%2F2021&key=${session.key}`;


    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", process.env.REACT_APP_API);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        setCurrentAccount(selectedAccount);

        const movementsByMonthCopy = JSON.parse(xhr.responseText);
        //  CREATE CATEGORIES AND GET MONTHLY EXPENSES
        movementsByMonthCopy.movements.forEach((movement) => {
          const newDataFormat = changeDateFormat(movement.date)
          const movementDate = new Date(newDataFormat).toLocaleDateString('en-US', dateOptions);
          const debitAmount = parseFloat(movement.debit) || 0;
          const creditAmount = parseFloat(movement.creidt) || 0;
          const totalSum = debitAmount + creditAmount;

          let monthExist = movementsByMonthCopy.hasOwnProperty(movementDate);
          let descriptionExist = termsDictionary.hasOwnProperty(CategorizeMovement(movement.detail));

          if (!descriptionExist) {
            termsDictionary[CategorizeMovement(movement.detail)] = { total: 0, movements: [] }
          }

          termsDictionary[CategorizeMovement(movement.detail)].movements.push(movement.detail);
          termsDictionary[CategorizeMovement(movement.detail)].total = totalSum + termsDictionary[CategorizeMovement(movement.detail)].total;

          if (!monthExist) {
            movementsByMonthCopy[movementDate] = { total: 0 };
          }

          movementsByMonthCopy[movementDate].total = debitAmount + parseFloat(movementsByMonthCopy[movementDate].total);

        });
        console.log(movementsByMonthCopy)
        console.log(termsDictionary)
        setCategories(termsDictionary)
        setMovementsByMonth(movementsByMonthCopy);
      }
    };

    xhr.send();
  };

  const setupPiechart = () => {
    const pieDataCopy = pieData;

    Object.entries(movementsByMonth).forEach(([key, value]) => {
      pieDataCopy.push([key, parseFloat(value.total, 10)])
    });

    pieDataCopy.unshift(['Expenses', 'Category'])

    setPieData(pieDataCopy);
  };

  const setupCategoryElements = () => {
    const catObj = categories;
    const incomeData = catObj.Income.total;
    const income50 = incomeData * 0.5;
    const income30 = incomeData * 0.3;
    const income20 = incomeData * 0.2;
    const currencyOptions = {
      style: "currency",
      currency: "USD"
    };

    const CategoriesBySpending = Object.entries(catObj).sort((catA, catB) => catB[1].total - catA[1].total);
    const livingCost = catObj['Transportation & Gas'].total + catObj['Groceries & Food'].total;
    const entertainmentCost = catObj['Entertainment'].total + catObj['Restaurants'].total;
    const savingAccount = catObj['Savings'].total;

    const RankElements = CategoriesBySpending.map((category) => {
      return (
        <li>{category[0]}</li>
      )
    });

    const renderCard = (color, content) => {
      const colorClass = `message ${color}`;
      return (
        <article style={{width: '90%'}} class={colorClass}>
          <div class="message-body">
            {content}
          </div>
        </article>
      )
    };

    return (
      <>
        <br/>
        <h2 className='has-text-light'>
          MetaBank Analytics | Account N. <span className='has-text-primary'>{currentAccount}</span><br/><br/>
          <span className='has-text-info'>Current Balance</span>: {incomeData.toLocaleString('default', currencyOptions)}
        </h2>
        <br/>
        <h5 className='has-text-light  is-uppercase has-text-primary'>TOP 3 CATEGORIES</h5>
        <br/>
        <div className="table-container">
          <table className="table is-bordered is-striped is-hoverable is-narrow">
            <thead>
              <th>Most Expenses</th>
              <th>Least Expenses</th>
            </thead>
            <tbody>
              <tr>
                <td>{CategoriesBySpending[0][0]}</td>
                <td>{CategoriesBySpending[CategoriesBySpending.length - 1][0]}</td>
              </tr>
              <tr>
                <td>{CategoriesBySpending[1][0]}</td>
                <td>{CategoriesBySpending[CategoriesBySpending.length - 2][0]}</td>
              </tr>
              <tr>
                <td>{CategoriesBySpending[2][0]}</td>
                <td>{CategoriesBySpending[CategoriesBySpending.length - 3][0]}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h5 className='has-text-light  is-uppercase has-text-primary'>SAVING INSIGHTS</h5>
        <br/>
        {income50 < livingCost && (
          renderCard('is-danger', <p><strong>Transport & Gas</strong>, <strong>Groceries</strong> and <strong>Rent</strong> Spending is above <strong>50%</strong></p>)
        )}

        {income30 < entertainmentCost && (
          renderCard('is-danger', <p><strong>Restaurants</strong> and <strong>Entertainment</strong> Spending is above <strong>30%</strong></p>)
        )}

        {income20 > savingAccount ? (
          renderCard('is-danger', <p>You should be <strong>SAVING</strong> at least <strong>20%</strong> of your income!</p>)
        ) : renderCard('is-success', <p className='has-text-weight-bold'>You're saving money like a CHAMP!!!</p>)}
        
        <article class="message is-link is-uppercase">
          <div class="message-header">
            <p className='has-text-weight-bold'>Keep in mind the 50/30/20 rules!</p>
          </div>
        </article>
       
        <br />
        <h1 className=' is-uppercase'>Scroll for more details:</h1>
        <br />
        <h2 className='has-text-primary is-uppercase'>Categories rank by expenses</h2>
        <div className='content'>
          <ol className='has-text-left' type='1'>
            {RankElements}
          </ol>
        </div>
        <br />
        <h2 className='is-uppercase has-text-primary'>Monthly expenses chart</h2>
        <br />
      </>
    )
  };

  useEffect(() => {
    if (movementsByMonth) setupPiechart();
    getAccounts();
  }, [movementsByMonth, session, currentAccount])

  const changeDateFormat = (dateString) => {
    const dateParts = dateString.split('/');
    const newDateObj = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

    return newDateObj;
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* Chart */}
        {pieData.length > 0 && (
          <>
            {setupCategoryElements()}
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
          </>
        )}
        {/* Available Accounts */}
        {accountCards && renderAccounts()}
        {/* LOGIN FORM */}
        {!session.key && LoginForm()}
      </header>
    </div>
  );
}


export default App;
