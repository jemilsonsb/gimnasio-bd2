import { app } from './app.js';
import { environment } from './config/environment.js';

app.listen(environment.port, () => {
  console.log(`API ejecutándose en http://localhost:${environment.port}`);
});
