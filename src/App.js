import React, { useState, useEffect } from "react";
import { Slider } from 'react-semantic-ui-range';
import { Button } from 'semantic-ui-react';
import numeral from 'numeral';
import AffordabilityMap from './components/AffordabilityMap';
import ColorRamp from './components/ColorRamp'
import API from './utils/API.js';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from 'react-icons/io';
import { MdPauseCircleFilled } from "react-icons/md";


const data = require('./data/median-sale-price.json');

const App = () => {
    const [income, setIncome] = useState(65381);
    const [tractData, setTractData] = useState();
    // const [affordablePayment, setAffordablePayment] = useState();
    // const [salePrice, setSalePrice] = useState();
    // const [percentOfIncome , setPercentOfIncome] = useState();
    // const [affordableLoan, setAffordableLoan] = useState();
    const [tractLayer, setTractLayer] = useState();
    const padding = 10;
    const maxIncome = 250000
    const minIncome = 10000

    const sliderSettings = {
        start: income,
        min: minIncome,
        max: maxIncome,
        step: 1000,
        onChange: value => setIncome(value)
    }

    const [ playStatus, setPlayStatus ] = useState({
        direction: null,
        playing: false,
    });

    const [timerID, setTimerID] = useState();
    // console.log(income);

    // const affordableLoanCalc = (income, year, apr) => {
    //     const percentOfIncome = .2;
    //     const affordablePayment = (income * percentOfIncome)/12;
    //     const n = year * 12;
    //     const c = apr/12;
    //     const paymentDivisor = (c * Math.pow((c + 1),n))/(Math.pow((c + 1), n) - 1);
    //     const affordableLoan = parseFloat(affordablePayment) / parseFloat(paymentDivisor);    

    //     setAffordablePayment(affordablePayment);
    //     setAffordableLoan(affordableLoan);
    // }

    const percentOfIncomeCalc = (income, salePrice, year, apr) => {
        const loan = salePrice - salePrice * .03
        const monthlyIncome = income / 12;
        const n = year * 12;
        const c = apr / 12;
        const paymentMultiplier = (c * Math.pow((c + 1),n))/(Math.pow((c + 1), n) - 1);
        const monthlyPayment = loan * paymentMultiplier;

        const percentOfIncome = monthlyPayment / monthlyIncome;

        return percentOfIncome * 100;
    }

    // console.log(percentOfIncomeCalc(10000, 30900, 30, .045))

    const handleTractData = income => {   
        // const income = event.target.value
        const modTractData = data ? 
            data.map(tract => ({
                'Census Tract' : tract['Census Tract'],
                'Median Sale Price' : tract['Median Sale Price'],
                // 'Income' : income,
                'Percent of Income' :  percentOfIncomeCalc(numeral(income).value(), parseFloat(tract['Median Sale Price']), 30, .045)
            })) : null
        setTractData(modTractData);
    }

    const playSlider = (init, duration, status, steps) => {
        
        const incomeSteps = status.direction === 'forward' ? steps : status.direction === 'reverse' ? -1 * steps : steps;
        let income = init;

        const increment = () => {
            income > maxIncome || income < minIncome ? setPlayStatus({ playing: false }) : setIncome(income);
            income = income + incomeSteps;
        }

        let timer = setInterval(increment, duration);

        // console.log(timer)
        setTimerID(timer)

        // console.log(timerID);
        // console.log(playStatus)


        // const stop = () => clearInterval(start)

        // const stop = () => !playStatus.playing ? clearInterval(play) : null
        // playStatus.playing ? stop() : start()
        // stop()
    }

    const stopSlider = () => {
        // console.log(playStatus)
        // console.log(timerID)
        clearInterval(timerID)
    }

    const sliderStartStop = (init, duration, status, steps) => !playStatus.playing ? stopSlider() : 
        playStatus.direction ? playSlider(init, duration, status, steps) : null;
        

    const getGeoJSON = () => {

        const url = `https://opendata.arcgis.com/datasets/798a9b46a48342e5a07cd9758623b839_157.geojson?where=PlanningRegion%20%3D%20'Atlanta%20Regional%20Commission'&outFields=GEOID`

        API.getData(url)
            .then(res => setTractLayer(res.data))
            .catch(err => console.error(err))
    }

    useEffect(() => getGeoJSON(), []);

    useEffect(() => handleTractData(income), [income]);

    useEffect(() => sliderStartStop(income, 50, playStatus, 1000), [playStatus.playing])

    return(
        <div style={{
            padding: padding
        }}>
            <h2 style={{lineHeight: '1em', textAlign: 'center', marginTop: '5px'}}>Home-ownership cost burden with a household income of...</h2>
            <h1 style={{lineHeight: '1em', textAlign: 'center'}}> {numeral(income).format('$0,0')}</h1>
            <div style={{float: 'left', width: '10%'}}>
                { 
                playStatus.playing && playStatus.direction === 'reverse' ? 
                <MdPauseCircleFilled 
                    style={{float: 'right', width: '30px', height: '30px'}} 
                    onClick={() => setPlayStatus({playing: false})}
                /> :
                <IoIosArrowDropleftCircle 
                    style={{
                        float: 'right', 
                        width: '30px', 
                        height: '30px', 
                        fill: playStatus.direction === 'forward' && playStatus.playing ? 'lightgrey' : null
                    }} 
                    onClick={() => playStatus.direction === 'forward' && playStatus.playing ? null : setPlayStatus({playing: true, direction: 'reverse'})}
                />
                }
            </div>
            <div style={{float: 'left', width: '80%'}}>
                <Slider style={{float: 'center', width: '100%'}} value={income} settings={sliderSettings} color='red'/>
            </div>
            <div style={{float: 'left', width: '10%'}}>
                {
                playStatus.playing && playStatus.direction === 'forward' ?
                <MdPauseCircleFilled 
                    style={{float: 'left', width: '30px',  height: '30px'}} 
                    onClick={() => setPlayStatus({playing: false})}
                /> :
                <IoIosArrowDroprightCircle 
                    style={{
                        float: 'left', 
                        width: '30px',  
                        height: '30px',
                        fill: playStatus.direction === 'reverse' && playStatus.playing ? 'lightgrey' : null
                    }} 
                    onClick={() => playStatus.direction === 'reverse' && playStatus.playing ? null : setPlayStatus({playing: true, direction: 'forward'}) }
                />
                }    
            </div>
            {tractData ? <div style={{ float: 'left', width: '100%', height: '63vh', marginTop: '20px'}}>  
                <AffordabilityMap data={tractData} geojson={tractLayer} />                              
            </div> : null }
            <h3 style={{float: 'left', textAlign: 'center', marginTop: '15px', lineHeight: '20px', width: '100%'}}>
                Proportion of household income spent on mortgage payments* each month...
            </h3>
            {tractData ? <ColorRamp /> : null }
            <p style={{float: 'left', fontSize: '1.2em'}}><strong>*</strong>for a home priced at a census tract's <em>median home sale price in 2018</em>, assuming a 4.5% 30-year fixed mortgage and 3% down payment</p>
            <p style={{float: 'left'}}><strong>Analysis by:</strong> The Atlanta Regional Commission's (ARC), Research and Analytics Group</p>
            <p style={{float: 'left'}}><strong>Data source:</strong> <a href='https://www.zillow.com/research/ztrax/'>Zillow. 2018. “ZTRAX: Zillow Transaction and Assessor Dataset, 2018-Q4.” Zillow Group, Inc.</a></p>
        </div>
    )
};

export default App;
