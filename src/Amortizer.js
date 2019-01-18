import Chart from "chart.js";

/*let totalMonths = 240;
let startingMonth = 1; // Jan is 0
let startingYr = 18;
let loanAmt = 3728474;
let interest = 8.4;
let prepaymentData = [
   {
      amt: 2500000,
      month: 2, // Jan is 0
      yr: 18
   },
   {
      amt: 1000000,
      month: 5,
      yr: 18
   }
];*/

const MONTHS = [
   "Jan",
   "Feb",
   "Mar",
   "Apr",
   "May",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Oct",
   "Nov",
   "Dec"
];

function getTimeData(startingMonth, startingYr, totalMonths) {
   let i = startingMonth;
   let count = 0;
   let data = [];
   let yr = startingYr;
   while (count < totalMonths) {
      if (i >= MONTHS.length) {
         i = 0;
         yr++;
      }
      data.push({
         label: MONTHS[i] + " " + yr,
         month: i,
         yr: yr
      });
      count++;
      i++;
   }
   return data;
}

function calculateAmortizationData(
   loanAmt,
   totalMonths,
   r,
   emi,
   prepaymentData
) {
   let data = [];
   let principalLeft = loanAmt;
   let i = 0;
   let pIdx = 0;
   while (i < totalMonths && principalLeft > 0) {
      let int = Math.round(r * principalLeft);
      let p = emi - int;
      if (pIdx < prepaymentData.length && prepaymentData[pIdx].idx === i) {
         principalLeft -= prepaymentData[pIdx].amt;
         pIdx++;
      }
      principalLeft -= p;
      if (principalLeft < 0) {
         p -= Math.abs(principalLeft);
         principalLeft = 0;
      }
      data.push({
         interest: int,
         principal: p,
         principalOutstanding: principalLeft
      });
      i++;
   }
   return data;
}

export function calculateFullAmortizationData(
   totalMonths,
   startingMonth,
   startingYr,
   loanAmt,
   interest,
   prepaymentData
) {
   if (!prepaymentData) prepaymentData = [];
   console.log("prepaymentData", prepaymentData);
   prepaymentData.forEach(function(d) {
      if (startingYr === d.yr) {
         d.idx = d.month - startingMonth;
      } else {
         let diff = d.yr - startingYr - 1;
         if (diff < 0) diff = 0;
         d.idx = diff * 12 + 12 - startingMonth + d.month + 1 - 1;
      }
   });
   prepaymentData.sort((a, b) => a.idx - b.idx);

   let r = interest / 1200;
   let r1 = Math.pow(r + 1, totalMonths);
   let emi = Math.round((loanAmt * r * r1) / (r1 - 1));
   let amorData = calculateAmortizationData(
      loanAmt,
      totalMonths,
      r,
      emi,
      prepaymentData
   );
   return {
      emi,
      timeData: getTimeData(startingMonth, startingYr, totalMonths),
      amorData,
      totalInt: amorData.reduce((count, d) => count + d.interest, 0),
      totalPrincipal:
         amorData.reduce((count, d) => count + d.principal, 0) +
         prepaymentData.reduce((count, d) => count + d.amt, 0)
   };
}

const CHART_COLORS = {
   red: "rgb(255, 99, 132)",
   orange: "rgb(255, 159, 64)",
   yellow: "rgb(255, 205, 86)",
   green: "rgb(75, 192, 192)",
   blue: "rgb(54, 162, 235)",
   purple: "rgb(153, 102, 255)",
   grey: "rgb(201, 203, 207)"
};

export function renderBarChart(fullAmortizationData, barChartCtx) {
   let barChartData = {
      labels: fullAmortizationData.timeData
         .slice(0, fullAmortizationData.amorData.length)
         .map(d => d.label),
      datasets: [
         {
            type: "line",
            label: "Principal outstanding",
            backgroundColor: Chart.helpers
               .color(CHART_COLORS.yellow)
               .alpha(0.5)
               .rgbString(),
            borderColor: CHART_COLORS.yellow,
            fill: false,
            data: fullAmortizationData.amorData.map(
               d => d.principalOutstanding
            ),
            yAxisID: "outstanding"
         },
         {
            type: "bar",
            label: "Interest",
            backgroundColor: CHART_COLORS.red,
            data: fullAmortizationData.amorData.map(d => d.interest),
            yAxisID: "bar"
         },
         {
            type: "bar",
            label: "Principal",
            backgroundColor: CHART_COLORS.blue,
            data: fullAmortizationData.amorData.map(d => d.principal),
            yAxisID: "bar"
         }
      ]
   };
   new Chart(barChartCtx, {
      type: "bar",
      data: barChartData,
      options: {
         title: {
            display: true,
            text: "Amortization"
         },
         tooltips: {
            mode: "index",
            intersect: false
         },
         responsive: true,
         scales: {
            xAxes: [
               {
                  stacked: true
               }
            ],
            yAxes: [
               {
                  id: "bar",
                  stacked: true
               },
               {
                  id: "outstanding"
               }
            ]
         }
      }
   });
}

export function renderPieChart(fullAmortizationData, pieChartCtx) {
   let data = [
      fullAmortizationData.totalInt,
      fullAmortizationData.totalPrincipal
   ];
   new Chart(pieChartCtx, {
      type: "pie",
      data: {
         datasets: [
            {
               data: data,
               backgroundColor: [CHART_COLORS.red, CHART_COLORS.blue],
               label: "Interest vs Principal"
            }
         ],
         labels: ["Interest", "Principal"]
      },
      options: {
         responsive: true
      }
   });
}
