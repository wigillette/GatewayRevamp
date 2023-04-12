const plannerModule = require("../planner")

beforeEach(() => {
  //const mainFilepath = path.resolve("server/app/model", 'main.db')
  //const mockFilepath = path.resolve("server/app/model", 'test.db')
  /*
  fs.copyFile(mainFilepath, mockFilepath, (err) => {
    if (err) throw err;
  });

  */
  //planner_module.setDB("test.tb")
});

describe('fetchPlan', () => {
  it('should fetch plan with status 200', async () => {
    const mReq = { userId: 1 };    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }
    await plannerModule.fetchPlan(mReq, mRes)
    expect(mRes.status).toBeCalledWith(200);
    expect(mRes.json.mock.calls).toHaveLength(1)
  });
});
