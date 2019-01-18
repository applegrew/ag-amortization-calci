import React from "react";
import { render } from "react-dom";
import { AmortInput, AmortOutput } from "./AmortInput";
import {
   calculateFullAmortizationData,
   renderBarChart,
   renderPieChart
} from "./Amortizer";

const styles = {
   fontFamily: "sans-serif",
   textAlign: "center"
};

render(
   <div>
      <AmortInput />
      <AmortOutput />
   </div>,
   document.getElementById("form"),
   function() {
      window.calculateAmortization = function(
         totalMonths,
         startingMonth,
         startingYr,
         loanAmt,
         interest,
         prepaymentData
      ) {
         let data = calculateFullAmortizationData(
            totalMonths,
            startingMonth,
            startingYr,
            loanAmt,
            interest,
            prepaymentData
         );
         console.log(data);
         let canvas = document.getElementById("graph");
         let ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         renderBarChart(data, ctx);
         canvas = document.getElementById("pie");
         ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         renderPieChart(data, ctx);
      };
   }
);
