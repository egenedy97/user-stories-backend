import App from "./app";
import AuthRoute from "./routes/auth.route";
import ProjectRoute from "./routes/project.route";
import TaskRoute from "./routes/task.route";
import UserRoute from "./routes/user.route";

const app = new App([
  new AuthRoute(),
  new ProjectRoute(),
  new TaskRoute(),
  new UserRoute(),
]);
app.listen();
