const planner_module = require("../planner")

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('fetchPlan', () => {
  it('should fetch plan with status 200', async () => {
    const mReq = { userId: 1 };    
    const mRes = mockResponse()
    await planner_module.fetchPlan(mReq, mRes)
    expect(mRes.status).toBeCalledWith(200);
    expect(mRes.json.mock.calls).toHaveLength(1)
  });
});