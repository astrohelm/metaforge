'use strict';

test: {
  console.log(1);
  if (true) break test;
  console.log(2)
}
