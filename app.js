//Budget controller
var budgetController = (function() {
    
    //some code

})();



// UI Controller
var UIController = (function() {

    var DOMstrings = {  // to reduce the amount of repeat code, plus much easier to make changes later
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
    };

    return {
        getinput: function() {
            return {
                /* BEFORE ADDING DOMSTRINGS LOOKED LIKE THIS
                type: document.querySelector('.add__type').value,  // will be either inc or exp 
                description: document.querySelector('.add__description').value, 
                value: document.querySelector('.add__value').value, 
                */
                //DOMstrings better for dry and easier to make changes later. Only need to change var above
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value, 
                value: document.querySelector(DOMstrings.inputValue).value, 
            };
        },
        getDOMstrings: function() { //exposes DOMstrings object into public 
            return DOMstrings;
        }
    };

})();



// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings(); //Can now call DOMstrings in this method

    var ctrlAddItem = function() {
        
        // 1. get the field input data
        var input = UICtrl.getinput();
        console.log(input);

        // 2. add the item to the budget controller

        // 3. add the item to the UI

        // 4. calculate the budget
        
        // 5. display the budget on the UI

    }

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress', function(event) {
        
        if (event.keycode === 13 || event.which === 13) { // which for older browsers
            ctrlAddItem();
        }

    });

})(budgetController, UIController);