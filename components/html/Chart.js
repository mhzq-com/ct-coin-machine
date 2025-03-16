import { useEffect, useState } from "react";
import ChartJS from "chart.js/auto"
import jQuery from "jquery";

const Chart = (props) => {

    //console.log(props);

    var dom;
    const [chart, setChart] = useState(undefined);
    const [loading, setLoading] = useState(undefined);

    useEffect(async ()=> {
        
        if(chart){
            return;
        }
        var ch = new ChartJS(
            dom,
            {
              type: 'line' 
              ,options: {
                responsive:true
                ,maintainAspectRatio:false
              }
            //   data:{
            //     labels: res.labels.map((o) => { return (new Date(o).toLocaleDateString())})
            //     ,datasets:  Object.keys(res.dataSets).map((o) => { 
            //         o = res.dataSets[o];
            //         return {
            //             label: `${o.resource.id} ${o.resource.code}`
            //             ,data: o.dataSet.map((d) => { return d.measurement}) 
            //             ,fill:false
            //             ,tension:0.4 
            //         }; 
            //     })
            //   }
            }
        );

        console.log(dom);

        setChart(ch);
    }, [dom])

    useEffect(async ()=>{

        console.log(props.documentId);

        if(!props.documentId)
        {
            return;
        }

        setLoading(true);

        // $(loading).removeClass("uk-hidden");
        // $(dom).removeClass("animate__fadeIn").addClass("animate__fadeOut");
        // if(chart){
        //     console.log("asd");
        //     chart.destroy();
        // }

        var res;
        var f = await fetch("/api/getTemperaturesForChart", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
                        redirect: 'follow', // manual, *follow, error
                        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                        body: JSON.stringify({ production: {id: props.documentId} }) // body data type must match "Content-Type" header
        });
        res = await f.json();

        setLoading(false);
        
        // $(loading).addClass("uk-hidden");
        
        // $(dom).removeClass("animate__fadeOut").addClass("animate__fadeIn");

        

        if(f.ok){
            if(chart){
                SetChartData(res);
            } 
        } else {
            UIkit.notification(res.message, {status: "danger"});
        }

        return chart;
        
          
    }, [props.documentId]);

    function SetChartData(res){
        chart.data.labels = res.labels.map((o) => { return (new Date(o).toLocaleDateString())});
        chart.data.datasets =  Object.keys(res.dataSets).map((o) => { 
            o = res.dataSets[o];
            return {
                label: `${o.resource.id} ${o.resource.code}`
                ,data: o.dataSet.map((d) => { return d.measurement}) 
                ,fill:false
                ,tension:0.4 
            }; 
        });

        // console.log(dom);
        
        chart.update();
        // if (dom) {
        // }
    }


    return <>
        <div className="uk-position-relative" style={{maxHeight: "50vh"}}>
            <div uk-spinner="true" className={`${loading?"":"uk-hidden"} loading uk-position-absolute uk-position-center`}></div>
            <canvas ref={(element) => { dom = element}} style={{width:"100%"}} >
            </canvas>
        </div>
    </>;

};

export default Chart;