/*
TC-ORD-01
Author: @horebcotto21

Description
Tests menu item class data pull, object creation and integration with UI. 
Unit tests for independent menu item creation, integration tests for 
repository driven menu item creation and integration tests for UI.

Preconditions
* Connection to database is successfull
* Menu item class has a constructor
*/

//Test Data
//<insert inputs used during execution> Section must be uncommented code.
import { IngredientItem, MenuItem } from "@/models/food-item-class";
// burgerIngred = IngredientItem; 
// addIngredient("lettuce");
// const ingredients = MenuItem.addIngredient("id", "lettuce", 2);
// foodItem: MenuItem;
const foodItem = new MenuItem("AA21", "lunch", "burger", [], 9.50, "https//www.google.com", true, ["none"], 12, "2026-03-16", "2026-03-16");
// foodItem.addIngredient("id", "tomato", 12);
const ingredients = foodItem.getIngredients();
const tomato: IngredientItem = {
    ingredients_id: "12",
    ingredients_names: "tomato",
    ingredients_price: 5
}
foodItem.addIngredient(tomato);
console.log(ingredients);
// MenuItem().ingredients[]
/*
Test Steps
<insert sequence of steps that will take place when executing the test>

. <insert step1>
. <insert step2>

Expected Results
<insert expected system behavior >

Notes
<insert notes, only if additional infromation is deemed necessary>

Reviewed By
<reviewer(s) fill this part>

====
*NOTE:* if there are any uncertainties, refer to the document in found within the following directory: `../../documentation/QualityAssurance/Test_Plan/test_strategy/define_test_case_design.adoc`. DO NOT INCLUDE THIS NOTE IN THE PRODUCED FILE.
====
*/