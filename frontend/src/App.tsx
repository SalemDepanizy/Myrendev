import React, { Suspense, lazy, useEffect } from "react";
import Login from "./Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./input.css";
import { tokenAtom } from "./lib/atoms/auth";
import {
	RequireAuth,
	RequireNonAuth,
	RequireRole,
} from "./components/auth/protect";
import { Navigate } from "react-router-dom";

import StudentsLogin from "./StudentsLogin";
import Agenda from "./Agenda";
import Start from "./Start";
import StudentsDetail from "./StudentsDetail";
import Students from "./Students";
import Home from "./Home";
import Side from "./Side";
import Moniteurs from "./Moniteurs";
import Addstudents from "./Addstudents";
import Addmoniteurs from "./Addmoniteurs";
import StudentsEdit from "./StudentsEdit";
import MoniteursEdit from "./MoniteursEdit";
import ForfaitEdit from "./ForfaitEdit";
import Forfait from "./Forfait";
import AddForfait from "./AddForfait";
import Test from "./Test";
import SuperAdmin from "./SuperAdmin";
import Commercial from "./Commercial";
import { Rating } from "@mui/material";
import Rate from "./Rate";
import AddRendezvous from "./AddRendezvous";
import AddCar from "./AddCar";
import Disponibilite from "./Disponibilite";
import ForgetPassword from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import Presentation from "./Presentation";
import SettingsProfilePage from "./SettingsProfilePage";
import SatisficationForm from "./SatisficationForm";
import HomePage from "./HomePage";
import Contacteznous from "./Contacteznous";
import Email from "./email";
import Satisfaction from "./Satisfaction";
import SatisfactionEdit from "./SatisfactionEdit";
import CorpSetting from "./CorpSetting";
import MessagePage from "./MessagePage";
import RendezvousClient from "./RendezvousClient";
import GeneralSettings from "./GeneralSettings";
import Valid from "./Valid";
import UnsubscribePage from "./Valid";
import Unsub from "./unsubscribe";
import Insatisfait from "./insatisfait";
import Satisfait from "./satisfait";
import TresSatisfait from "./tresSatisfait";
// import PasswordSetup from "./PasswordSetup";
import { useAuth } from "./lib/hooks/auth";
import MultipleDayPicker from "./MonitorDaysOff";
import ChangePassword from "./ChangePassword";
// const AddRendezvous = React.lazy(() => import('./AddRendezvous'));
import {
	NotificationProvider,
	useNotification,
} from "./components/NotificationContext"; // Import the notification context

function App() {
	useEffect(() => {
		const unsub = tokenAtom.subscribe((token) => {
			if (!token) {
				window.location.reload();
			}
		});

		return () => {
			unsub.disconnect();
		};
	}, []);

	return (
		<div className={`overflow-x-hidden w-full h-full`}>
			<BrowserRouter>
				<Suspense fallback={<div>Loading...</div>}>
					<NotificationProvider>
						<Routes>
							<Route
								path="/unsubscribe/:id"
								element={<Unsub />}
							/>
							<Route path="/test" element={<Test />}></Route>
							<Route
								path="/rendezvousclient"
								element={<RendezvousClient />}
							></Route>
							<Route
								path="/messagePage"
								element={<MessagePage />}
							></Route>
							<Route
								path="/contacteznous"
								element={<Contacteznous />}
							></Route>
							<Route
								path="/satisfaction"
								element={
									<RequireRole role="ENTREPRISE">
										{" "}
										<Satisfaction />
									</RequireRole>
								}
							></Route>

							<Route
								path="/"
								element={
									<RequireNonAuth redirect="/dashboard">
										<HomePage />{" "}
									</RequireNonAuth>
								}
							></Route>
							<Route
								element={
									<RequireAuth redirect="/">
										<Side />
									</RequireAuth>
								}
							>
								<Route
									path="/dashboard"
									element={<Home />}
								></Route>
								<Route
									path="/Congé"
									element={
										<RequireRole role="MONITOR">
											<MultipleDayPicker />{" "}
										</RequireRole>
									}
								></Route>
								<Route
									path="/students"
									element={
										<RequireAuth>
											<RequireRole role="ENTREPRISE">
												{" "}
												<Students />{" "}
											</RequireRole>
										</RequireAuth>
									}
								></Route>
								<Route
									path="/moniteurs"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Moniteurs />
										</RequireRole>
									}
								></Route>
								<Route
									path="/create"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Addstudents />
										</RequireRole>
									}
								></Route>
								<Route
									path="/createmoniteurs"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Addmoniteurs />
										</RequireRole>
									}
								></Route>
								<Route
									path="/studentsEdit/:id"
									element={<StudentsEdit />}
								></Route>
								<Route
									path="/changePassword"
									element={<ChangePassword />}
								></Route>
								<Route
									path="/Details/insatisfait"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Insatisfait />
										</RequireRole>
									}
								></Route>
								<Route
									path="/Details/satisfait"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Satisfait />
										</RequireRole>
									}
								></Route>
								<Route
									path="/Details/tresSatisfait"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<TresSatisfait />
										</RequireRole>
									}
								></Route>

								<Route
									path="/SettingsProfilePage"
									element={<SettingsProfilePage />}
								></Route>
								<Route
									path="/moniteursEdit/:id"
									element={<MoniteursEdit />}
								></Route>
								<Route
									path="/email"
									element={<Email />}
								></Route>
								<Route
									path="/forfaitEdit/:id"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<ForfaitEdit />
										</RequireRole>
									}
								></Route>
								<Route
									path="/addRendezvous"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<AddRendezvous />
										</RequireRole>
									}
								></Route>
								<Route
									path="/agenda"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Agenda />
										</RequireRole>
									}
								></Route>
								<Route
									path="/forfait"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Forfait />
										</RequireRole>
									}
								></Route>
								<Route
									path="/createforfait"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<AddForfait />
										</RequireRole>
									}
								></Route>
								{/* <Route path="/superadmin" element= {<SuperAdmin />}></Route> */}

								{/* <Route path="/superadmin" element={<RequireSuperAdmin > <SuperAdmin /> </RequireSuperAdmin>} /> */}
								<Route
									path="/superadmin"
									element={
										<RequireRole role="ADMIN">
											<SuperAdmin />
										</RequireRole>
									}
								/>

								<Route
									path="/commercial"
									element={
										<RequireRole role="COMMERCIAL">
											<Commercial />
										</RequireRole>
									}
								></Route>

								<Route path="/rate" element={<Rate />}></Route>

								{/* <Route path="/rate/:id" element={<Rate />}></Route> */}

								<Route
									path="/disponibilite"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<Disponibilite />
										</RequireRole>
									}
								></Route>
								<Route
									path="/addcar"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<AddCar />
										</RequireRole>
									}
								></Route>
								<Route
									path="/parametre"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<CorpSetting />
										</RequireRole>
									}
								></Route>
								<Route
									path="generalsettings"
									element={<GeneralSettings />}
								></Route>

								<Route
									path="/satisficationForm"
									element={
										<RequireRole role="ENTREPRISE">
											{" "}
											<SatisficationForm />{" "}
										</RequireRole>
									}
								></Route>
								<Route
									path="/SatisfactionEdit/:id"
									element={<SatisfactionEdit />}
								></Route>
							</Route>

							<Route
								path="/HomePage"
								element={<HomePage />}
							></Route>
							<Route path="/login" element={<Login />}></Route>
							<Route
								path="/presentation"
								element={<Presentation />}
							></Route>
							<Route
								path="/presentation/:id"
								element={<Presentation />}
							></Route>
							<Route
								path="/satisficationForm"
								element={<SatisficationForm />}
							></Route>

							<Route
								path="/forgetpassword"
								element={<ForgetPassword />}
							></Route>
							<Route
								path="/reset-password/:token"
								element={<ResetPassword />}
							></Route>
							<Route path="/start" element={<Start />}></Route>
							<Route
								path="/studentsLogin"
								element={<StudentsLogin />}
							></Route>

							<Route
								path="/studentsdetail/:id"
								element={<StudentsDetail />}
							></Route>
						</Routes>
					</NotificationProvider>
				</Suspense>
			</BrowserRouter>
		</div>
	);
}

export default App;
