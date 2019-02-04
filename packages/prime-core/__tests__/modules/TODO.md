```tsx
describe('External', () => {
  describe('Schema', () => {
    describe('Create schema', () => {
      it('should not name conflict');
      it('should not crash with no fields set');
    });
    describe('Create template', () => {
      it('should not show SEO in queries');
      it('should have schema inherit its fields');
    });
    describe('mutations = no', () => {
      it('should not show createPost mutation');
    });
    describe('settings.mutations.create = true', () => {
      it('should show createPost mutation');
      it('should not show updatePost mutation');
    });
    describe('settings.mutations = { create: true, update: true }', () => {
      it('should show createPost mutation');
      it('should show updatePost mutation');
      it('should not show removePost mutation');
    });
    describe('settings.mutations = true', () => {
      it('should show createPost mutation');
      it('should show updatePost mutation');
      it('should show removePost mutation');
    });
    describe('auth = yes', () => {
      it('should be able to insert doc without auth');
    });
    describe('auth = no', () => {
      it('should be able to insert doc with auth');
      it('should not be able to insert doc without auth');
      it('should not be able to insert with auth but without allowed role/rule');
    });
  });
  describe('Documents', () => {

 describe('queries=no', () => {
   it('should not show Post in graphql');
   it('should not show allPost in graphql');
   it('should not allow Post union in PrimeDocument');
 });
 describe('queries=yes', () => {
   it('allPost should show correct items');
   it('Post should show correct item');
 });
 describe('allPost', () => {
   it('should show correct order with one sortBy key');
   it('should show correct order with nested sortBy key');
   it('should show correct order with two sortBy keys');
   it('should show correct order with native sortBy (createdAt/publishedAt/id)');
   it('should show correct posts with one filter');
   it('should show correct posts with nested filter');
   it('should show correct posts with two filters');
   it('should show correct posts with complex nested AND/OR filters');
   it('should not show unpublished posts');
 });
 describe('Post', () => {
   it('should not show deleted post');
   it('should show published post');
   it('should not show unpublished post');
 });
 describe('Post->Author', () => {
   it('should not show unpublished relation');
   it('should not show deleted relation');
  });
});
```
