//Budget controller.  controls incomes and expenses
var budgetController = (function() {
    
    var Expense = function(id, description, value) {  //Function constructor. remember name capitalized
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
/* Could make variables to store data, but best prctice below is to store all data together, cleaner
    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;*/
    var data = {   //This is our data structure
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1  // -1 is like saying does not exist
    };

    return {   //public method to allow other modules to add items to our data structure
        addItem: function(type, des, val) {
            var newItem, ID;
            //create new id. incrementally add id numbers from last entry
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Push it to our data structure
            data.allItems[type].push(newItem);
            // Return the new element
            return newItem;
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent. will only calculate if there is positive income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }          
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();



// UI Controller
var UIController = (function() {

    var DOMstrings = {  // reduce repeat code and class names, plus much easier if something/names changes in the UI later
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    };

    return {
        getInput: function() {
            return {
                /* BEFORE ADDING DOMSTRINGS LOOKED LIKE THIS
                type: document.querySelector('.add__type').value,  // will be either inc or exp 
                description: document.querySelector('.add__description').value, 
                value: document.querySelector('.add__value').value, 
                */
                //DOMstrings better for dry and easier to make changes later. Only need to change var above
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value, 
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat converts numbers as strings to numbers
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // create html string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields); // trick to take the list made from querySelectorAll and convert to an array

            fieldsArr.forEach(function(current, index, array) { // loops over fields array. forEach good to loop over arrays
                current.value = '';
            });
            fieldsArr[0].focus(); // to reset the focus to the description field ie fieldsArr[0]
        },

        displayBudget: function(obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        getDOMstrings: function() { //exposes DOMstrings object into public 
            return DOMstrings;
        }
    };

})();



// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings(); //Can now call DOMstrings in this method

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
        
            if (event.keycode === 13 || event.which === 13) { // which for older browsers
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function() {        
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();        
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) { /* input should be different from empty string && it should be different than is NaN(ie a number) && input value > 0. isNaN is builtin js function */
        // 2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. clear the fields
        UICtrl.clearFields();

        // 5. calculate and update budget
        updateBudget();
        }
    };

    return {
        init: function() { // public init function, place for us to put all our code for when we want to start the application
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init(); // need to call init function outside the IIFE only code out here