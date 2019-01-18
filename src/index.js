import React from "react";
import { render } from "react-dom";
import { ParentComponent as AmorComponent } from "./AmortIO";
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
      <AmorComponent />
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
         let canvas = document.getElementById("graph");
         let ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         renderBarChart(data, ctx);
         canvas = document.getElementById("pie");
         ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         renderPieChart(data, ctx);
         return data;
      };
   }
);
