import { PrefectureRatingsWebPage } from './app.po';

describe('prefecture-ratings-web App', () => {
  let page: PrefectureRatingsWebPage;

  beforeEach(() => {
    page = new PrefectureRatingsWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
