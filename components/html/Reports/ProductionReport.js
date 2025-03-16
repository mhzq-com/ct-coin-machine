import React, { useState } from "react";
import classnames from "classnames";
export default function ProductionReport(props) {

    var groupByItems = props.items ? props.items.reduce((a, b) => a + (parseFloat(b.weight) || 0), 0) : undefined;
    var groupByItemsMeasured = props.items ? props.items.reduce((a, b) => a + (parseFloat(b.measuredWeight) || 0), 0) : undefined;

    return <div>
        <table className="uk-table uk-width-1-1">
            <caption>Komposztálások</caption>
            <thead>
                <tr>
                    <th>Azonosító</th>
                    <th>Kezdés</th>
                    <th>Befejezés</th>
                    <th>Súly (kg)</th>
                    <th>Mért súly (kg)</th>
                    <th>Felhasznált anyag (kg)</th>
                    <th>Térfogat (m3)</th>
                    <th>Nedvesség (%)</th>
                </tr>
            </thead>

            <tbody>
                {props.items != undefined && (

                    props.items.map((item) => {
                        return <tr key={item.id}>
                            <td>{item.id}</td>
                            <td><div>{new Date(item.startDate).toLocaleDateString()}</div>
                                <div>{new Date(item.startDate).toLocaleTimeString()}</div>
                            </td>
                            <td><div>{new Date(item.endDate).toLocaleDateString()}</div>
                                <div>{new Date(item.endDate).toLocaleTimeString()}</div>
                            </td>
                            <td>{item.weight?.toFixed(2)}</td>
                            <td>{item.measuredWeight?.toFixed(2)}</td>
                            <td>{item.usedItemWeight}</td>
                            <td>{item.volume?.toFixed(2)}</td>
                            <td>{item.moisture?.toFixed(0)}</td>
                            <td>{item.weight}</td>
                            <td className="uk-text-right">
                                <a href={`/reports/production/?id=${item.id}`} target="_blank"><button type="button" data-id={item.id} className="uk-button uk-button-primary no-print">
                                    <i className="fa-solid fa-print"></i>
                                </button>
                                </a> 
                        
                            </td>
                        </tr>



                    })

                )
                }
            </tbody>
        </table>
        {props.items != undefined && (

            <>
                <div className="fa-2x uk-text-right">

                    Össz súly: {groupByItems}
                </div>
                <div className="fa-2x uk-text-right">

                    Össz mért súly: {groupByItemsMeasured}
                </div>
            </>

        )
        }
    </div>
        ;

}