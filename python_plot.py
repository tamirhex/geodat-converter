import sys
import matplotlib.pyplot as plt
import json


def plotPolyline():
    with open('./testLogs/datapolyline.json') as json_file:
        data = json.load(json_file)
        polyline = data["layerFromDxfSource"][0]["polyline"]
        xArray = []
        yArray = []
        for value in polyline:
            xArray.append(value["point"]["xLng"])
            yArray.append(value["point"]["yLat"])
        plt.plot(xArray, yArray)
        #print(data["layerFromDxfSource"]["polyline"][0]["point"]["xLng"])
        #json.layerFromDxfSource.polyline

def plotSections():
    with open('./testLogs/datasections.json') as json_file:
        data = json.load(json_file)
        sectionsArray = data["layerFromDxfSource"]["sectionsArray"]
        for value in sectionsArray:
            x0 = value["pointi"]["point"]["xLng"]
            y0 = value["pointi"]["point"]["yLat"]
            x1 = value["pointf"]["point"]["xLng"]
            y1 = value["pointf"]["point"]["yLat"]
            plt.plot([x0,x1],[y0,y1])


if __name__ == '__main__':
    if sys.argv[1] == "sections":
        plotSections()
    elif sys.argv[1] == "notsections":
        plotPolyline()
    elif sys.argv[1] == "both":
        plotPolyline()
        plotSections()
    else:
        print("bad argument, either sections, notsections, or both")
    plt.show()

