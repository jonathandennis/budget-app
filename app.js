//Budget controller.  controls incomes and expenses
var budgetController = (function() {
    
    var Expense = function(id, description, value) {  //Function constructor. remember name capitalized
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
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

        deleteItem: function(type, id) {
            var ids, index;
            // below makes current array of indexes. IMPORTANT to take into account previous deletions do not make for simple linear numbering. This takes that into account
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id); // finds the index of the current id using built-in indexOf method

            if (index !== -1) {
                data.allItems[type].splice(index, 1); //splice is method to remove item 1st= what (index) 2nd= how many (1 item)
            }

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

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
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
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        // + or - before number

        // exactly 2 decimal places
        
        // commas separating the thousands
        num = Math.abs(num);
        num = num.toFixed(2); // rounds to two decimal places

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }
        
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: function(selectorID) {
            /* two ways to do below, second is better practice. You cannot just simply delete any element in JavaScript. you can only delete/remove a child element. so we need to remove through the parent element, by moving up in the DOM and then removeChild */
            //document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function() {
            var now, months, year, month;

            var now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); /* event listener to delete items. listens to the entire container as it contains both income and expense options for removal. Uses event bubbling to target event */
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {        
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();        
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2 Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
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

        // 6. calculate and update percentages
        updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // targets the actual event to the id. where the event is fired

        if (itemID) {

            //inc-1.  isolating each item to facilitate proper removal
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); // parseInt needed to change the returned string to an integer

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show the new budget
            updateBudget();
            // 4. calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() { // public init function, place for us to put all our code for when we want to start the application
            console.log('Application has started.');
            UICtrl.displayMonth();
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