#TI4: Praktikum
#UWB Lokalisierung
#Adrian Gruszczynski
#Anna/e Eckhardt
#Tobias Hellwig
from django.views import generic
from django.shortcuts import render
from django.http import HttpResponse
import csv
import ast

# Create your views here.


def index(request):
  d = dict()
  i = 0
  a = []

  with open('static/data.csv', 'r') as csvfile:
    reader = csv.reader(csvfile, delimiter=';')
    for row in reader:
      a = []
      a.append(ast.literal_eval(row[0]))
      a.append(ast.literal_eval(row[1]))
      a.append(ast.literal_eval(row[2]))
      a.append(ast.literal_eval(row[3]))
      d[i] = a
      i += 1

  context = {"json" : { "v" : list(d.values())}}

  return render(request, "index.html", context)