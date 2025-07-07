from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
import uvicorn
import asyncio
import json
from templates import foodTemplate, flightTemplate

load_dotenv()

app = FastAPI()
llm = ChatOpenAI(model="gpt-4o")

@app.get("/ping")
async def ping():
    return {"message": "Server is alive!"}

@app.websocket("/ws/agent")
async def websocket_agent(websocket: WebSocket):
    await websocket.accept()

    try:
        initialData = await websocket.receive_text()
        data = json.loads(initialData)

        async def step_hook(agent: Agent):
            agentOutputs = agent.state.history.model_outputs()
            if agentOutputs:
                latestOutput = agentOutputs[-1]
                stepUpdate = {
                    "next_goal": latestOutput.current_state.next_goal
                }
                await websocket.send_text(json.dumps(stepUpdate))

        formattedTask = ""
        
        if data["taskType"] == "food":
            address = data["details"]["address"]
            restaurantName = data["details"]["restaurantName"]
            item = data["details"]["item"]

            formattedTask = foodTemplate(address, restaurantName, item)
        elif data["taskType"] == "flight":
            toCity = data["details"]["toCity"]
            fromCity = data["details"]["fromCity"]
            date = data["details"]["date"]
            firstName = data["details"]["firstName"]
            lastName = data["details"]["lastName"]
            dateOfBirth = data["details"]["dateOfBirth"]
            email = data["details"]["email"]
            phoneNumber = data["details"]["phoneNumber"]

            formattedTask = flightTemplate(toCity, fromCity, date, firstName, lastName, dateOfBirth, email, phoneNumber)

        agent = Agent(
        task=formattedTask,
        llm=llm,
        )

        result = await agent.run(
        on_step_start=step_hook
        )

        visitedLog= agent.state.history.urls()

        lastLink = visitedLog[-1] if visitedLog else None

        await websocket.send_text(json.dumps({
            "status": "done",
            "result": lastLink
        }))

        await websocket.close()
            
    except Exception as e:
        print("Error:", e)
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
