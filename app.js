//==============================
// BUDGET CONTROLLER
//==============================
var budgetController = (function() {

        // Function constructor for Expenses
        var Expense = function(id, description, value) {
                this.id = id;
                this.description = description;
                this.value = value;
                this.percentage = -1;
        };

        Expense.prototype.calcPercentage = function(totalIncome) {
                if (totalIncome > 0) {
                        this.percentage = Math.round((this.value/ totalIncome) * 100);
                } else {
                        this.percentage = -1;
                }
        };

        Expense.prototype.getPercentage = function() {
                return this.percentage;
        };

        // Function constructor for Incomes
        var Income = function(id, description, value) {
                this.id = id;
                this.description = description;
                this.value = value;
        };

        var calculateTotal = function(type) {
                var sum = 0;
                // loop through either the expense array or the income array and get the total of all items
                data.allItems[type].forEach(function(cur) {
                        sum += cur.value;
                });
                // save the total calculated above into the totals array for each respective total type (inc or exp)
                data.totals[type] = sum;
        };
        
        // Create the data structure that holds all of the data
        var data = {
                allItems: {
                        exp: [],
                        inc: []
                },
                totals: {
                        exp: 0,
                        inc: 0
                },
                budget: 0,
                percentage: -1
        };

        return {
                addItem: function(type, des, val) {
                        var newItem, ID;

                        // Create new ID
                        if (data.allItems[type].length > 0) {
                                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                        }else {
                                ID = 0;
                        }

                        // Create new item based on 'inc' or 'exp' type
                        if (type === 'exp') {
                                newItem = new Expense(ID, des, val);
                        } else if (type === 'inc') {
                                newItem = new Income(ID, des, val);
                        };

                        // push the new item into our data structure
                        data.allItems[type].push(newItem);

                        // return the new element
                        return newItem;
                        
                },

                deleteItem: function(type, id) {
                        var ids, index;

                        // use the .map function loops through the designated array and returns a whole new array
                        // with the ids of each item
                        ids = data.allItems[type].map(function(current) {
                                return current.id;
                        });

                        index = ids.indexOf(id);

                        if (index !== -1) {
                                data.allItems[type].splice(index, 1);
                        }
                },

                calculateBudget: function() {
                        // calculate total income and expenses
                        calculateTotal('exp');
                        calculateTotal('inc');

                        // calculate the budget: income - expenses
                        data.budget = data.totals.inc - data.totals.exp;

                        // calculate the budget percentage (income/expenses)
                        if (data.totals.inc > 0) {
                                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                        }else {
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

//==============================
// UI CONTROLLER
//==============================
var UIController = (function() {

        DOMStrings = {
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
                // exactly 2 decimal points
                // comma separating the thousands
                num = Math.abs(num);
                num = num.toFixed(2);

                numSplit = num.split('.');

                int = numSplit[0];
                if (int.length > 3) {
                        int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
                }
                dec = numSplit[1];

                //type === 'exp' ? sign = '-' : sign = '+';

                //return type + '' + int + '.' + dec;

                return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };

        var nodeListforEach = function(list, callback) {
                for ( var i = 0; i < list.length; i++) {
                        callback(list[i], i);
                }
        };

        return {
                getInput: function() {
                        return {
                                type: document.querySelector(DOMStrings.inputType).value,  // will be either 'inc' or 'exp'
                                description: document.querySelector(DOMStrings.inputDescription).value,
                                // parseFloat converts a number string into a number with decimals
                                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
                        }
                        
                },

                addListItem: function(obj, type){
                        var html, newHtml, element;
                        // create HTML with placeholder text
                        
                        if (type === 'inc') {
                                element = DOMStrings.incomeContainer;
                                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                        }else if (type === 'exp') {
                                element = DOMStrings.expensesContainer;
                                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                        };

                        // replace the placeholder text with some actual data
                        newHtml = html.replace('%id%', obj.id);
                        newHtml = newHtml.replace('%description%', obj.description);
                        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

                        // insert the HTML into the DOM
                        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
                },

                deleteListItem: function(selectorID) {
                        var el = document.getElementById(selectorID);
                        el.parentNode.removeChild(el);
                },

                // Empty the input fields after making a budget entry
                clearFields: function() {
                        var fields , fieldsArr;

                        // saves the two input fields into a usable variable
                        // the querySelector is in CSS format, which is why the two arguments are separated by a comma inside ''
                        // the document.querySelectorAll method saves these two elements in a list, not an array
                        fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

                        // use the slice method (a preset method for arrays only), than use the call method to apply the slice
                        // to the 'fields' variable that we saved above to turn the saved list from 'fields' into an array that
                        // we can use the 'forEach' function to below
                        fieldsArr = Array.prototype.slice.call(fields);

                        // use the forEach method on the fieldsArr. 'forEach' is like the for loop, but can only
                        // be applied to arrays
                        fieldsArr.forEach(function(current, index, array) {
                                current.value = "";
                        });

                        // set the focus back on the first element in the fieldsArr array, which is the 'description' field
                        fieldsArr[0].focus();
                },

                displayBudget: function(obj) {
                        var type;
                        obj.budget > 0 ? type = 'inc' : type = 'exp';
                        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                        document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                        

                        if (obj.percentage > 0) {
                                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
                        }else {
                                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
                        }
                },

                displayPercentages: function(percentages) {
                        var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

                        nodeListforEach(fields, function(current, index) {
                                if (percentages[index] > 0) {
                                        current.textContent = percentages[index] + '%';
                                }else {
                                        current.textContent = percentages[index] + '---';
                                }
                        });
                },

                displayMonth: function() {
                        var now, months, month, year;
                        now = new Date();
                        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        month = now.getMonth();
                        year = now.getFullYear();
                        document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
                },

                changedType: function() {
                        var fields = document.querySelectorAll(
                                DOMStrings.inputType + ',' + 
                                DOMStrings.inputDescription + ',' + 
                                DOMStrings.inputValue
                        );

                        nodeListforEach(fields, function(cur) {
                                cur.classList.toggle('red-focus');
                        });

                        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
                },

                // expose DOMStrings object to the public
                getDOMStrings: function() {
                        return DOMStrings;
                }
        }

})();

//==============================
// GLOBAL APP CONTROLLER: connects the other two controllers
//==============================
var controller = (function(budgetCtrl, UICtrl) {

        var setupEventListeners = function() {
                var DOM = UICtrl.getDOMStrings();

                document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

                document.addEventListener('keypress', function(event) {
                        if (event.keyCode === 13 || event.which === 13) {
                                ctrlAddItem();
                        }
                });

                document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

                document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        };

        var updateBudget = function() {
                // calculate the new budget
                budgetCtrl.calculateBudget();
                // return the budget
                var budget = budgetCtrl.getBudget();
                // display the updated budget in the UI
                UICtrl.displayBudget(budget);
        };

        var updatePercentages = function() {
                // calculate percentages
                budgetCtrl.calculatePercentages();

                // read percentages from the budget controller
                var percentages = budgetCtrl.getPercentages();

                //update the UI
                UICtrl.displayPercentages(percentages);
        }

        var ctrlAddItem = function() {
                var input, newItem;

                // get the filled input data
                input = UICtrl.getInput();

                // check if the description field is not empty, and if the value field is not not-a-number and greater than 0
                if (input.description !== "" && !isNaN(input.value) && input.value > 0){
                        // add the item to the budget controller
                        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                        // add the new item to the UI
                        UICtrl.addListItem(newItem, input.type);

                        // Clear input fields
                        UICtrl.clearFields();

                        // calculate and update budget
                        updateBudget();

                        // calculate and update percentages
                        updatePercentages();
                }
        };

        var ctrlDeleteItem = function(event) {
                var itemID, splitID, type, ID;
                itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

                if (itemID) {
                        // retreive the type and ID of the item to delete
                        splitID = itemID.split('-');
                        type = splitID[0];
                        ID = parseInt(splitID[1]);

                        // Delete the item from the data structure
                        budgetCtrl.deleteItem(type, ID);
                        // delete the item from the UI
                        UICtrl.deleteListItem(itemID);
                        // update the new budget totals
                        updateBudget();

                        // calculate and update percentages
                        updatePercentages();
                }
        };

        return {
                init: function() {
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
        }

})(budgetController, UIController);

controller.init();