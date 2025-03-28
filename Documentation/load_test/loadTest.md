### Load Testing Results

Our non-functional feature is to handle 20 concurrent users with handling 200 requests per minute.


### Test Conditions
* We used Apache JMeter to perform our load testing
* Number of threads (users): 20
* Ramp-up period (seconds): 0
* Loop Count: 1 time per user
* Duration: 60 seconds
* Total: 500 requests in total

### How to Run
1. Start Apache Jmeter
2. Open the loadTest.jmx file
3. Make sure the application is running
4. Press start to run the tests


### Results
[!See results.csv](https://github.com/Dean6622/Comp4350-Team3/blob/EricChu_loadTest/Documentation/load_test/loadtest_results.csv)

Since our goal was 20 concurrent users and being able to handle a total of over 200 requests per minute, we have successfully reached our target by handling 20 users and a total of 500 requests per minute.
