const test = require('tape');
const request = require('supertest');
const app = require('./server.js');

test('get /', t => {
  request(app)
    .get('/')
    .expect(200)
    .end(err => {
      const msg = 'should return 200 ok';
      if (err) return t.fail(msg);
      t.pass(msg);
      t.end();
    });
});

test('post /sdokqwe', t => {
  const recipe = { name: 'sdokqwe', ingredients: ['asqwew', 'asdf'] };
  request(app)
    .post('/sdokqwe')
    .send(recipe)
    .expect('recipe sdokqwe added')
    .end(err => {
      const msg = 'should add recipe sdokqwe';
      if (err) return t.fail(msg);
      t.pass(msg);
      t.end();
    });
});

test('put /sdokqwe', t => {
  const recipe = { name: 'sdokqwe', ingredients: ['czxzc', 'asdf', 'adsdf'] };
  request(app)
    .put('/sdokqwe')
    .send(recipe)
    .expect('recipe sdokqwe updated')
    .end(err => {
      const msg = 'should edit recipe sdokqwe';
      if (err) return t.fail(msg);
      t.pass(msg);
      t.end();
    });
});

test('delete /sdokqwe', t => {
  request(app)
    .delete('/sdokqwe')
    .expect('recipe sdokqwe deleted')
    .end(err => {
      const msg = 'should delete recipe sdokqwe';
      if (err) return t.fail(msg);
      t.pass(msg);
      t.end();
    });
});
