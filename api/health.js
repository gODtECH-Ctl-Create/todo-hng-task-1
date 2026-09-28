module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      error: 'Method not allowed',
      allowed: ['GET'],
    });
  }

  return res.status(200).json({
    status: 'ok',
    service: 'taskflow-api',
  });
};
