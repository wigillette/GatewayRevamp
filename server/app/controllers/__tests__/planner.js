// TODO create a mock DB and call commands from it,
// and check the status to make sure the outputs are correct

function sum(a, b) {
  return a + b;
}


test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});


