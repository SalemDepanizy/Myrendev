import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetcher } from "./axios";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Button from "./components/Button";
// import logo from "./assets/logo.png";
import { Result } from "antd";

export default function Unsub() {
	const { id } = useParams();
	const [unsub, setUnsub] = useState(false);
	const { isMutating, trigger } = useSWRMutation(
		id,
		async (id, { arg }: { arg: string }) => {
			if (!id) return null;
			return (await fetcher.get(`users/unsubscribe/${id}`)).data;
		},
		{
			onSuccess() {
				setUnsub(true);
			},
		}
	);
	if (!id) return null;
	if (isMutating) return <div>loading</div>;
	if (unsub)
		return (
			<div>
				<Result status="success" title="Vous êtes désabonné !" />{" "}
			</div>
		);
	return (
		<div className=" min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
			<div className="py-3 sm:max-w-xl sm:mx-auto">
				<div className="bg-white min-w-xl flex flex-col rounded-xl shadow-lg">
					<div className="px-12 py-5">
						<div className="max-w-sm w-full text-gray-600">
							<div className="text-center">
								<img
									src="../src/assets/logo.png"
									width={180}
									className="mx-auto"
								/>
								<div className="mt-5 space-y-2">
									<h3 className="text-gray-800 text-2xl font-bold sm:text-3xl mb-4">
										Êtes-vous sûr de vouloir vous désabonner
										?{" "}
									</h3>
								</div>
							</div>

							<div className="flex justify-center">
								<Button
									onClick={() => {
										trigger(id);
									}}
								>
									Se désabonner
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
