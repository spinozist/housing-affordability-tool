import React from "react";
// import API from "../../utils/API";
import colormap from 'colormap';

const colorRampWidth = 80;
const lableWidth = (100 - colorRampWidth)/2

const ColorRamp = props => {

    // console.log(props)

    const numberOfBins = 72;
    const colorMap = 'portland';

    const colors = colormap({
        colormap: colorMap,
        nshades: numberOfBins,
        format: 'hex',
        alpha: 1
      })

    const binWidthRatio = colorRampWidth/numberOfBins;
    const binWidth = String(binWidthRatio) + "%";

    return (

        <div style={{float: 'left', width: '100%', height: '5%'}}>
            <div
                style={{
                    // position: 'relative',
                    // bottom: '60px',
                    // paddingTop: '8px',
                    borderRadius: '5px 0 0 5px',
                    // border: 'solid grey .8px', 
                    backgroundColor: 'white', 
                    fontSize: '1.5em',
                    textAlign: 'center',
                    float: 'left',
                    height: '100%',
                    width: String(lableWidth) + '%',
                    marginBottom: '15px',
                    // zIndex: '999'
                }}>
                10% or less
            </div>
        { colors ? colors.map(color => 
            <div 
            style={{
                // position: 'relative',
                // bottom: '60px',
                float: 'left',
                height: '30px',
                backgroundColor: color,
                width: binWidth,
                marginBottom: '15px',
                opacity: 1,
                zIndex: '999'
            }}
            />) : null}
                    <div
                style={{
                    // position: 'relative',
                    // bottom: '60px',
                    borderRadius: '0 5px 5px 0',
                    // paddingTop: '8px',
                    // border: 'solid grey .8px', 
                    backgroundColor: 'white', 
                    fontSize: '1.5em',
                    textAlign: 'center',
                    float: 'left',
                    height: '100%',
                    width: String(lableWidth) + '%',
                    marginBottom: '15px',
                    // zIndex: '999'
                }}>
                50% or more
            </div>
        </div>
    );
};

export default ColorRamp;