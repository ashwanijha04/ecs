/*
 * Copyright 2013. Amazon Web Services, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

const ecs = new AWS.ECS({
    region: "us-east-1"
});

function runECSTasks(clusterName, taskDefinition, count) {
    if (clusterName && taskDefinition && count) {
        const params = {
            cluster: clusterName,
            taskDefinition: taskDefinition,
            launchType: "FARGATE",
            count: count,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-5bxxxxxxxx5",
                        "subnet-8fb4xxxxxxx5"
                    ],
                    assignPublicIp: "ENABLED",
                    securityGroups: [
                        "sg-0c80xxxxxf717689f"
                    ]
                }
            }
        };

        ecs.runTask(params, function(err, data) { // run task api to run ECS tasks
            if (err) console.log(err, err.stack);
            else checkForRunningTasks(clusterName, data);
        });
    } else {
        console.log("Pass Valid parameters");
    }
}

function checkForRunningTasks(clusterName, {tasks}) {
    let params = {
        tasks: [],
        cluster: clusterName
    };

    for (let i = 0; i < tasks.length; i++) {
        params.tasks.push(tasks[i].taskArn);
    }

    console.log(params);

    console.log("// After retries results :-")

    ecs.waitFor('tasksRunning', params, function(err, data) { // waits for ECS tasks to be into RUNNING state
        if (err) console.log(err.message);
        else console.log(data);
    });

}

runECSTasks("testRetries", "FargateNGINX:3", 10); // cluster name , task definition, count of tasks to run at a time.
