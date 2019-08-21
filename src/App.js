import React, { useState, useEffect } from "react";
import { Slider } from 'react-semantic-ui-range';
import numeral from 'numeral';
import AffordabilityMap from './components/AffordabilityMap';
import ColorRamp from './components/ColorRamp'
import API from './utils/API.js';


const saleValueByTract = require('./data/median-sale-price.json');



const App = () => {
    const [income, setIncome] = useState(50000);
    const [tractData, setTractData] = useState();
    const [affordablePayment, setAffordablePayment] = useState();
    const [salePrice, setSalePrice] = useState();
    const [percentOfIncome , setPercentOfIncome] = useState();
    const [affordableLoan, setAffordableLoan] = useState();
    const [tractLayer, setTractLayer] = useState();
    const padding = 10;

    const sliderSettings = {
        start: income,
        min: 20000,
        max: 250000,
        step: 1000,
        onChange: value => setIncome(value)
    }
    // console.log(income);

    const affordableLoanCalc = (income, year, apr) => {
        const percentOfIncome = .2;
        const affordablePayment = (income * percentOfIncome)/12;
        const n = year * 12;
        const c = apr/12;
        const paymentDivisor = (c * Math.pow((c + 1),n))/(Math.pow((c + 1), n) - 1);
        const affordableLoan = parseFloat(affordablePayment) / parseFloat(paymentDivisor);    

        setAffordablePayment(affordablePayment);
        setAffordableLoan(affordableLoan);
    }

    const percentOfIncomeCalc = (income, salePrice, year, apr) => {
        const loan = salePrice - salePrice * .03
        const monthlyIncome = income / 12;
        const n = year * 12;
        const c = apr / 12;
        const paymentMultiplier = (c * Math.pow((c + 1),n))/(Math.pow((c + 1), n) - 1);
        const monthlyPayment = loan * paymentMultiplier;

        // console.log(salePrice)


        const percentOfIncome = monthlyPayment / monthlyIncome;

        return percentOfIncome * 100;
    }

    const handleTractData = income => {   
        // const income = event.target.value
        const modTractData = saleValueByTract ? 
            saleValueByTract.map(tract => ({
                'Census Tract' : tract['Census Tract'],
                'Median Sale Price' : tract['Median Sale Price'],
                // 'Income' : income,
                'Percent of Income' :  percentOfIncomeCalc(numeral(income).value(), parseFloat(tract['Median Sale Price']), 30, .045)
            })) : null
        setTractData(modTractData);
    }

    const getGeoJSON = () => {

        const url = `https://opendata.arcgis.com/datasets/798a9b46a48342e5a07cd9758623b839_157.geojson?where=PlanningRegion%20%3D%20'Atlanta%20Regional%20Commission'&outFields=GEOID`

        API.getData(url)
            .then(res => setTractLayer(res.data))
            .catch(err => console.error(err))
    }

    useEffect(() => getGeoJSON(), []);

    useEffect(() => handleTractData(income), [income])

    return(
        <div style={{
            padding: padding
        }}>
            <h2>Housing Affordability with an income of {numeral(income).format('$0,0')}</h2>

            <Slider value={income} settings={sliderSettings} color='red'/>
            {/* <input 
                name='income'
                placeholder='Enter Income'
                value={income}
                onChange={event => {
                    setIncome(numeral(event.target.value).format('$0,0'))
                    // setPercentOfIncome();
                    // handleTractData(event)
                }}
            /> */}
            {/* <input
                style={{
                    margin: 10
                }} 
                name='home-sale-price'
                placeholder='Enter Sale Price'
                value={salePrice}
                onChange={event => {
                    setSalePrice(numeral(event.target.value).format('$0,0'))
                    setPercentOfIncome();
                }}

            />
            <button
                // onClick={() => affordableLoanCalc(income.value(), 30, .045)} 
                onClick={() => {
                    setPercentOfIncome(percentOfIncomeCalc(numeral(income).value(), numeral(salePrice).value(), 30, .045));
                    handleTractData();
                }}
                style={{
                    margin: 10
                }}
            >
                Calculate Percent of Income to Afford
            </button> */}
            {/* <h3>{percentOfIncome ? `With an income of ${income}, the mortgage payment for a house costing ${salePrice} would be ${percentOfIncome.toFixed(1)}% of your income each month.` : null }</h3> */}
            <h3> {tractData && percentOfIncome ?
                'Below is a map of affordability across the region at that income...' : null}</h3>
            {/* <h3>Affordable Monthly Payment: ${affordablePayment}</h3> */}
            {/* <h3>Affordable Loan: ${affordableLoan}</h3> */}
            {/* {tractData ? tractData.map(tract => <p>{tract['Census Tract'] + ": " + tract['Percent of Income']}</p>) : null} */}
            {tractData ? <div style={{ float: 'left', width: '100%', height: '65vh'}}>  
                <AffordabilityMap data={tractData} geojson={tractLayer} />                              
            </div> : null }
            <h2>Proportion of income spent on mortgage payments* each month...</h2>
            {tractData ? <ColorRamp /> : null }
            <p style={{float: 'right', fontSize: '1.2em'}}><strong>*</strong>for a home priced at a census tract's median home value with 3% down and a 4.5% 30-year fixed mortgage</p>
            <p style={{float: 'left'}}><strong>Data source:</strong> US Census Bureau, American Community Survey (ACS), 5-year estimates, 2013-17</p>
        </div>
    )
};

export default App;