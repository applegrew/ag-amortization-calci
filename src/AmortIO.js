import React from "react";
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import TextField from "@material-ui/core/TextField";

const styles = theme => ({
   root: theme.mixins.gutters({
      paddingTop: 16,
      paddingBottom: 16,
      marginTop: theme.spacing.unit * 3
   }),
   formControl: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
   },
   slider: {
      padding: "22px 0px"
   }
});

function AmtNumberFormatCustom(props) {
   const { inputRef, onChange, ...other } = props;

   return (
      <NumberFormat
         {...other}
         getInputRef={inputRef}
         onValueChange={values => {
            onChange({
               target: {
                  value: values.value
               }
            });
         }}
         thousandSeparator
         thousandsGroupStyle="lakh"
         prefix="&#8377;"
      />
   );
}

AmtNumberFormatCustom.propTypes = {
   inputRef: PropTypes.func.isRequired,
   onChange: PropTypes.func.isRequired
};

class rAmortInput extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         totalMonths: 240,
         startDate_extra: {},
         totalPrePayments: 0,
         interest: "8.95",
         interest_extra: { value: 8.95 }
      };
   }

   handleNumberChange(name, event, event2) {
      let decimals = 0;
      if (typeof event === "number") {
         decimals = event;
         event = event2;
      }
      let value = event.target.value;
      let newVal = 0;
      let strNewVal = "";
      let decimalPos = -1;
      if (value) {
         newVal = 0;
         for (let i = 0; i < value.length; i++) {
            let c = value.charCodeAt(i);
            if (c >= 48 && c <= 57) {
               if (decimals > 0 && decimalPos > -1 && i - decimalPos > decimals)
                  continue;
               newVal = 10 * newVal + c - 48;
               strNewVal += String.fromCharCode(c);
            }
            if (decimals > 0 && c === 46 && decimalPos === -1) {
               decimalPos = i;
               strNewVal += ".";
            }
         }
         if (decimals > 0 && decimalPos > -1) {
            let div = (newVal + "").length - decimalPos;
            if (div !== 0) newVal = newVal / Math.pow(10, div);
         }
      }
      if (decimals > 0) {
         this.handleChange(name, event, strNewVal);
         this.handleChange(name + "_extra", event, { value: newVal });
      } else this.handleChange(name, event, newVal);
   }

   handleDateChange(name, event) {
      let extra = { m: 0, y: 0 };
      let value = event.target.value;
      let newVal = "";
      if (value) {
         newVal = "";
         let yr = "0";
         for (let i = 0; i < value.length && i < 7; i++) {
            let ch = value.charAt(i);
            if (i === 2) newVal += "/";
            let c = value.charCodeAt(i);
            if (c >= 48 && c <= 57) {
               newVal += ch;
               if (i < 2) extra.m = parseInt(newVal);
               if (i > 2) yr += ch;
            }
         }
         extra.y = parseInt(yr);
         if (extra.y < 1900 || extra.m < 1 || extra.m > 12) extra.valid = false;
         else extra.valid = true;
      }
      this.handleChange(name, event, newVal);
      this.setState({ [name + "_extra"]: extra });
   }

   handleChange(name, event, value) {
      this.setState({ [name]: value });
   }

   addRow() {
      const { prePays = [] } = this.state;
      prePays.push(Math.floor(Math.random() * 1000000));
      this.setState({ prePays });
   }

   getPrepayRow(index) {
      const { prePays } = this.state;
      const id = prePays[index];
      const { classes } = this.props;
      const {
         ["payAmount" + id]: amt,
         ["payDate" + id]: date,
         ["payDate" + id + "_extra"]: extra = {}
      } = this.state;
      return (
         <Grid item xs={12} key={id}>
            <FormControl className={classes.formControl}>
               <TextField
                  id={"payAmount" + id}
                  label="Payment amount"
                  value={amt}
                  onChange={this.handleNumberChange.bind(
                     this,
                     "payAmount" + id
                  )}
                  InputProps={{
                     inputComponent: AmtNumberFormatCustom
                  }}
               />
            </FormControl>
            <FormControl className={classes.formControl}>
               <InputLabel htmlFor={"payDate" + id}>
                  Payment month & year
               </InputLabel>
               <Input
                  id={"payDate" + id}
                  error={extra.valid === false}
                  value={date}
                  onChange={this.handleDateChange.bind(this, "payDate" + id)}
                  placeholder="MM/YYYY"
               />
            </FormControl>
            <IconButton
               className={classes.button}
               aria-label="Delete"
               onClick={() => {
                  prePays.splice(index, 1);
                  delete this.state["payDate" + id];
                  this.setState({ prePays });
               }}
            >
               <DeleteIcon />
            </IconButton>
         </Grid>
      );
   }

   getPrePayData(index) {
      const { prePays } = this.state;
      const id = prePays[index];
      const {
         ["payAmount" + id]: amt = 0,
         ["payDate" + id + "_extra"]: date = {}
      } = this.state;
      return { amt, date };
   }

   calculate() {
      const {
         totalMonths = 0,
         prePays = [],
         startDate_extra: startDate = {},
         loanAmount = 0,
         interest_extra: interest = {}
      } = this.state;
      let prePayData = [];
      for (let i = 0; i < prePays.length; i++) {
         let { amt, date } = this.getPrePayData(i);
         prePayData.push({ amt, month: date.m, yr: date.y });
      }
      let data = window.calculateAmortization(
         totalMonths,
         startDate.m - 1,
         startDate.y,
         loanAmount,
         interest.value,
         prePayData
      );
      const { onCalculate } = this.props;
      if (onCalculate) onCalculate(data);
   }

   render() {
      const { classes } = this.props;
      const {
         totalMonths: value,
         prePays = [],
         startDate_extra = {},
         loanAmount,
         interest,
         interest_extra
      } = this.state;
      let prePayHtml = [];
      let allPrepayDataValid = true;
      for (let i = 0; i < prePays.length; i++) {
         prePayHtml.push(this.getPrepayRow(i));
         let data = this.getPrePayData(i);
         if (!data.amt || data.amt <= 0 || !data.date.valid) {
            allPrepayDataValid = false;
         }
      }
      let allDataValid = false;
      if (
         value > 0 &&
         startDate_extra.valid === true &&
         loanAmount > 0 &&
         interest_extra.value > 0 &&
         allPrepayDataValid
      ) {
         allDataValid = true;
      }
      return (
         <div>
            <Paper className={classes.root} elevation={4}>
               <InputLabel htmlFor="tenure">
                  Total tenure (in months)
               </InputLabel>
               <Slider
                  id="tenure"
                  value={value}
                  aria-labelledby="tenure"
                  classes={{ container: classes.slider }}
                  min={6}
                  max={420}
                  step={1}
                  onChange={this.handleChange.bind(this, "totalMonths")}
               />
               <Typography>
                  {value} months | {Math.floor(value / 12)} yrs {value % 12}{" "}
                  months
               </Typography>
            </Paper>
            <Paper className={classes.root} elevation={4}>
               <FormControl fullWidth className={classes.margin}>
                  <InputLabel htmlFor="startDate">
                     Starting month & year
                  </InputLabel>
                  <Input
                     id="startDate"
                     error={startDate_extra.valid === false}
                     value={this.state.startDate}
                     onChange={this.handleDateChange.bind(this, "startDate")}
                     placeholder="MM/YYYY"
                  />
               </FormControl>
            </Paper>
            <Paper className={classes.root} elevation={4}>
               <FormControl fullWidth className={classes.margin}>
                  <TextField
                     id="loanAmount"
                     value={loanAmount}
                     label="Loan amount"
                     InputProps={{
                        inputComponent: AmtNumberFormatCustom
                     }}
                     onChange={this.handleNumberChange.bind(this, "loanAmount")}
                  />
               </FormControl>
            </Paper>
            <Paper className={classes.root} elevation={4}>
               <FormControl className={classes.margin}>
                  <TextField
                     id="interest"
                     value={interest}
                     label="Interest"
                     InputProps={{
                        endAdornment: (
                           <InputAdornment variant="filled" position="end">
                              %
                           </InputAdornment>
                        )
                     }}
                     onChange={this.handleNumberChange.bind(
                        this,
                        "interest",
                        2
                     )}
                  />
               </FormControl>
            </Paper>
            <Paper className={classes.root} elevation={4}>
               <Typography variant="h5" gutterBottom>
                  Prepayment schedule (if any)
               </Typography>
               <Grid container spacing={24}>
                  {prePayHtml}
                  <Grid item xs={12}>
                     <Button
                        variant="contained"
                        className={classes.button}
                        onClick={this.addRow.bind(this)}
                     >
                        Add
                     </Button>
                  </Grid>
               </Grid>
            </Paper>
            <Paper className={classes.root} elevation={4}>
               <Button
                  disabled={!allDataValid}
                  variant="contained"
                  className={classes.button}
                  onClick={this.calculate.bind(this)}
               >
                  Calculate
               </Button>
            </Paper>
         </div>
      );
   }
}

class rAmortOutput extends React.Component {
   constructor(props) {
      super(props);
   }
   render() {
      const { classes, emi } = this.props;
      return (
         <Paper className={classes.root} elevation={4}>
            <Typography variant="h5" gutterBottom>
               Resulting graph
            </Typography>
            <Typography>Calculated EMI: ₹{emi}</Typography>
            <canvas id="graph" />
            <canvas id="pie" />
         </Paper>
      );
   }
}

const AmortInput = withStyles(styles)(rAmortInput);
const AmortOutput = withStyles(styles)(rAmortOutput);

class ParentComponent extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         emi: "_"
      };
   }
   render() {
      const { emi } = this.state;
      return (
         <div>
            <AmortInput
               onCalculate={data => {
                  if (data) this.setState({ emi: data.emi });
               }}
            />
            <AmortOutput emi={emi} />
         </div>
      );
   }
}

export { ParentComponent };
