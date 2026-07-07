import './env'; // must be first: loads .env before routes read process.env
import app from './app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
