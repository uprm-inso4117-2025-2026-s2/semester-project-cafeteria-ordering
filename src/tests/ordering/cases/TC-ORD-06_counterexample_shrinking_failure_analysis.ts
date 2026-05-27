/*
TC-ORD-06
Author: Kaysha Pagan

Description
This test analyzes how counterexample shrinking can help simplify failing 
random test cases during property based testing for cart subtotal calculations.

Preconditions
* fast check installed as a development dependency.
* Cart subtotal calculation logic available for testing.
* Property based testing configured with Jest.

Test Data

* failureThreshold = 100

Test Steps

. Generate randomized cart data using fast check.
. Execute failing property assertions.
. Observe generated counterexamples.
. Observe shrinking behavior from fast check.
. Analyze reduced failing examples.

Expected Results

. fast check generates failing randomized inputs.
. Counterexamples are displayed correctly.
. Shrinking reduces failing inputs into smaller examples.
. Reduced failures are easier to analyze and debug.

Notes

This test focuses on how shrinking can help reduce complex failing
inputs into smaller counterexamples that are easier to understand.

Reviewed By
<reviewer fills this section>
*/

export const failureThreshold = 100;